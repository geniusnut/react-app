import {EventEmitter} from "events";
import IMController from '../Controllers/IMController';
import CacheStore from './CacheStore';
import AppStore from './ApplicationStore';

class ChatStore extends EventEmitter {
    constructor() {
        super();
        this.reset();

        this.addIMListener();
        this.setMaxListeners(Infinity);
    }

    reset = () => {
        this.items = new Map();
    };

    set(chat) {
        console.log("ChatStore set", chat.id, chat)
        this.items.set(chat.id, chat);
    }

    get(chatId) {
        return this.items.get(chatId);
    }

    onUpdate = update => {
        console.log("chatstore onUpdate:" , update);
        switch (update['@type']) {
            case 'queryConv': {
                const {convs} = update;
                const chatIds = [];
                for (let i = 0; i < convs.length; i++) {
                    this.updateConv(convs[i]);
                }
                this.emitUpdate(update);
                break;
            }
            case 'tgtMsgSend':
            case 'msgAcked' :{
                const msg = update.msg;
                const lastTs = msg.getAckts() / 1000_000;
                const chat = this.items.get(msg.getConversationid());
                this.assign(chat, {last_msg: msg, last_ts: lastTs});
                update = {...update, chatId: msg.getConversationid()}
                this.emitUpdate(update);
                break;
            }
        }
    };

    assign(source1, source2) {
        //Object.assign(source1, source2);
        const chat = Object.assign({}, source1, source2);
        this.set(chat);
        CacheStore.saveChat(chat.id, chat);
    }

    updateConv(conv) {
        let chat = this.items.get(conv.getId());
        if (!chat) {
            console.log('ChatStore new conv: ', conv);
            var extra = conv.getType() === 0 ? conv.getCidsList().find(cid => {
                    return !(cid === IMController.state.cid)
                }) : conv.getMembersList();
            chat = {id: conv.getId(), conv:conv, type: conv.getType(), extra: extra, last_ts:0}
            this.set(chat);
            if (AppStore.cacheLoaded) {
                CacheStore.saveChat(conv.getId(), chat);
            }
            return;
        }
        this.assign(chat, {conv:conv})
    }

    onClientUpdate = update => {
        switch (update['@type']) {
            case 'clientUpdateOpenChat': {
                this.emitUpdate(update);
                break;
            }
        }
    };

    emitUpdate = update => {
        this.emit(update['@type'], update);
    };

    addIMListener() {
        IMController.addListener('update', this.onUpdate);
        IMController.addListener('clientUpdate', this.onClientUpdate);
    }

    getSortedItems() {
        return Array.from(new Map([...this.items.entries()]
            .sort((a, b) => b[1].last_ts - a[1].last_ts))
            .keys());
    }
}

const store = new ChatStore();
window.chat = store;
export default store;