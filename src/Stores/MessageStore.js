import {EventEmitter} from "events";
import IMController from "../Controllers/IMController";
import CacheStore from "./CacheStore";

export const StateEnum = Object.freeze({
    STATE_NONE: 0,
    STATE_SEND: 1,
    STATE_ACK: 2,
    STATE_RECEIPT: 3,
    STATE_READ: 4,
});

export function isOutgoing(state) {
    return state === StateEnum.STATE_SEND || state === StateEnum.STATE_ACK || state === StateEnum.STATE_READ;
}

class MessageStore extends EventEmitter {
    constructor() {
        super();

        this.reset();

        this.addIMListener();
        this.setMaxListeners(Infinity);
    }

    reset = () => {
        this.items = new Map();
        this.unread = new Map();
        this.loaded = new Set();
        this.maxIds = new Map();
    };

    addIMListener() {
        IMController.addListener('update', this.onUpdate);
        IMController.addListener('clientUpdate', this.onClientUpdate);
    }

    onUpdate = update => {
        switch (update['@type']) {
            case 'tgtMsgSend': {
                const msg = update.msg;
                this.set(msg);
                this.addUnreadMsg(msg);
                update = {chat_id: msg.getConversationid(), ...update}
                this.emit("tgtMsgSend", update);
                break;
            }
            case 'messagePull': {
                const {msgs, finished} = update
                let inserted = false;
                msgs.forEach( msg => {
                    if (!this.contains(msg)) {
                        this.set(msg)
                        inserted = true
                    }
                });
                inserted && this.emit("tgtMsgSend", update);
                break;
            }
            case 'msgAck': {
                const msgAck = update.msgAck;
                this.updateLocal(msgAck);
                this.emit("msgAck", {
                    msgId: msgAck.getId(),
                    chatId: msgAck.getConversationid(),
                });
                break;
            }
            case 'msgRead': {
                const msgRead = update.msgRead;
                this.updateRead(msgRead);
                this.clearUnread(msgRead);
                this.emit("msgRead", {
                    msgId: msgRead.getId(),
                    chatId: msgRead.getConversationid(),
                });
                break;
            }
            case 'msgHasRead': {
                const msgRead = update.msgRead;
                this.updateReadLocal(msgRead);
                this.emit("msgHasRead", {
                    msgId: msgRead.getId(),
                    chatId: msgRead.getConversationid(),
                });
                break;
            }
            case 'messageUpdate': {
                const  {convId, msgId} = update;
                console.log("messageUpdate", {convId: convId}, {msgId: msgId}, {lastMsgId: this.getLastMsgId(convId)})
                if (msgId > this.getLastMsgId(convId)) {
                    IMController.pullMessage(convId, this.getLastMsgId(convId))
                }
                break
            }
        }
    };

    onClientUpdate = update => {
        switch (update['@type']) {
            case 'clientSendMessage': {
                this.setLocal(update.msg);
                this.emitUpdate(update);
                break
            }
            case 'clientUpdateMessagesLoaded': {
                this.emitUpdate(update);
                break;
            }
        }
    };

    emitUpdate = update => {
        this.emit(update['@type'], update);
    };

    contains(message) {
        if (!message) return false;
        let chat = this.items.get(message.getConversationid());
        if (!chat) return false;
        if (chat.get(message.getConversationid()) || chat.get(message.getJetts())) return true;
        return false;
    }

    set(message) {
        if (!message) return;

        let chat = this.items.get(message.getConversationid());
        if (!chat) {
            chat = new Map();
            this.items.set(message.getConversationid(), chat);
        }

        const m = {state: StateEnum.STATE_RECEIPT, msg: message, ts: message.getAckts() / 1000_000}
        chat.set(message.getId(), m);
        if (this.maxIds.get(message.getConversationid()) || 0 < message.getId()) {
            this.maxIds.set(message.getConversationid(), message.getId())
        }
        CacheStore.saveMessage(message.getConversationid(), message.getId(), m)
    }

    setLocal(message) {
        if (!message) return;
        const chatId = message.getConversationid();

        let chat = this.items.get(chatId);
        if (!chat) {
            chat = new Map();
            this.items.set(chatId, chat);
        }
        const m = {state: StateEnum.STATE_SEND, msg: message, ts: message.getJetts()};
        chat.set(message.getJetts(), m);
        CacheStore.saveMessage(chatId, message.getJetts(), m);
    }

    updateReadLocal(msgRead) {
        if (!msgRead) return;
        const [chatId, msgId] = [msgRead.getConversationid(), msgRead.getId()];
        let chat = this.items.get(chatId);
        if (!chat) {
            return;
        }
        console.log("updateReadLocal", chatId, msgId)
        for (let message of chat.values()) {
            if (message.msg && message.msg.getId() === msgId) {
                console.log("updateReadLocal message.msg.getId", message.msg.getId())

                const m = {...message, state: StateEnum.STATE_READ}
                chat.set(message.msg.getJetts(), m)
                CacheStore.saveMessage(chatId, message.msg.getJetts(), m);
                return
            }
        }
        // chat.values.forEach(message => {
        //     if (!message.msg && message.msg.getId() !== msgId) return;
        //     message.state = StateEnum.STATE_READ;
        // })
    }

    updateRead(msgRead) {
        if (!msgRead) return;
        const [chatId] = msgRead.getConversationid();
        let chat = this.items.get(chatId);
        if (!chat) {
            return;
        }
        const key = msgRead.getId();
        let message = chat.get(key);
        if (!message) {
            return;
        }
        message.state = StateEnum.STATE_READ;

        const m = {...message, state: StateEnum.STATE_READ}
        chat.set(key, m);
        CacheStore.saveMessage(chatId, key, m);
    }

    updateLocal(msgAck) {
        if (!msgAck) return;

        let chat = this.items.get(msgAck.getConversationid());
        if (!chat) {
            return;
        }
        const key = msgAck.getJetts();
        let message = chat.get(key);
        if (!message) {
            return;
        }
        message.msg.setAckts(msgAck.getAckts());
        message.msg.setId(msgAck.getId());
        message.state = StateEnum.STATE_ACK;

        const m = {...message, state: StateEnum.STATE_ACK}
        chat.set(msgAck.getJetts(), m);
        CacheStore.saveMessage(message.msg.getConversationid(), key, m);
        IMController.update({
            '@type': 'msgAcked',
            msg: m.msg,
        })
    }

    get(chatId, messageId) {
        let chat = this.items.get(chatId);
        if (!chat) {
            //this.load(chatId, messageId);
            return null;
        }

        let message = chat.get(messageId);
        if (!message) {
            //this.load(chatId, messageId);
            return null;
        }

        return message;
    }

    addMessages(chatId, msgs) {
        console.log("MessageStore addMessages", chatId, msgs);
        let chat = this.items.get(chatId);
        if (!chat) {
            chat = new Map();
            this.items.set(chatId, chat);
        }
        msgs.forEach((v, k) => {
            chat.set(k, v)
        })
    }

    getMessages(chatId) {
        console.log("MessageStore getMessages", chatId);
        if (this.loaded.has(chatId)) {
            this.loaded.add(chatId);
            // this.addMessages(chatId, CacheStore.loadMessages(chatId));
        }
        let chat = this.items.get(chatId);
        if (!chat) {
            return [];
        }
        // chat.values.
        return Array.from(chat.values()).sort((a,b) => ((a.ts > b.ts) ? 1 : -1));
    }

    getLastMsgId(chatId) {
        return this.maxIds.get(chatId) || 0
    }

    addUnreadMsg(msg) {
        if (!msg) return;
        const [convId, msgId] = [msg.getConversationid(), msg.getId()];
        if (!convId) return;
        if (!this.unread.has(convId)) {
            this.unread.set(convId, new Set());
        }

        this.unread.get(convId).add(msgId)
    }

    clearUnread(msgRead) {
        if (!msgRead) return;
        const [convId, msgId] = [msgRead.getConversationid(), msgRead.getId()];
        if (!convId) return;
        if (!this.unread.has(convId)) return;
        this.unread.get(convId).delete(msgId);
    }

    getUnreadByChatId(chatId) {
        let s = this.unread.get(chatId)
        return s ? s.size : 0;
    }

    getUnread() {
        let s = 0;
        [...this.unread.values()].forEach(item => {
            s += item.size
        })
        return s;
    }
}

const store = new MessageStore();
window.message = store;
export default store;