import {EventEmitter} from "events";
import IMController from '../Controllers/IMController';

class ChatStore extends EventEmitter {
    constructor() {
        super();
        this.reset();

        this.addIMListener();
    }

    reset = () => {
        this.items = new Map();
    };

    set(chat) {
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
            case 'tgtMsgSend': {
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
        this.set(Object.assign({}, source1, source2));
    }

    updateConv(conv) {
        const chat = this.items.get(conv.getId());
        if (!chat) {
            this.items.set(conv.getId(), {id: conv.getId(), conv:conv, type: conv.getType(), last_ts:0});
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