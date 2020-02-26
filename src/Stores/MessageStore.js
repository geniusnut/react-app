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
    return state === StateEnum.STATE_SEND || state === StateEnum.STATE_ACK;
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
        this.loaded = new Set();
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
                this.emit("tgtMsgSend", update);
                break;
            }
            case 'msgAck': {
                const msgAck = update.msgAck;
                this.updateLocal(msgAck);
                this.emit("msgAck", update);
                break;
            }
            case 'msgRead': {
                const msgRead = update.msgRead;
                this.updateRead(msgRead);
                this.emit("msgRead", update);
                break;
            }}
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

    set(message) {
        if (!message) return;

        let chat = this.items.get(message.getConversationid());
        if (!chat) {
            chat = new Map();
            this.items.set(message.getConversationid(), chat);
        }

        const m = {state: StateEnum.STATE_RECEIPT, msg: message, ts: message.getAckts() / 1000_000}
        chat.set(message.getId(), m);
        CacheStore.saveMessage(message.getConversationid(), message.getId(), m)
    }

    setLocal(message) {
        if (!message) return;

        let chat = this.items.get(message.getConversationid());
        if (!chat) {
            chat = new Map();
            this.items.set(message.getConversationid(), chat);
        }
        const m = {state: StateEnum.STATE_SEND, msg: message, ts: message.getJetts()};
        chat.set(message.getJetts(), m);
        CacheStore.saveMessage(message.getConversationid(), message.getJetts(), m);
    }

    updateRead(msgRead) {
        if (!msgRead) return;
        let chat = this.items.get(msgRead.getConversationid());
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
        CacheStore.saveMessage(message.msg.getConversationid(), key, m);
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
}

const store = new MessageStore();
window.message = store;
export default store;