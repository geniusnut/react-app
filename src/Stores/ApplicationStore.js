import {EventEmitter} from "events";
import IMController from "../Controllers/IMController";
import {AuthStateEnum} from "./AuthorizationStore";

class ApplicationStore extends EventEmitter {
    constructor() {
        super();

        this.reset();
        this.addIMListener();
        this.setMaxListeners(Infinity);
    }

    reset = () => {
        this.cid = null;
        this.chatId = 0;
        this.dialogChatId = 0;
        this.messageId = 0;

        this.authorizationState = null;
    };

    getChatId() {
        return this.chatId;
    }

    getCid() {
        return this.cid;
    }

    getMessageId() {
        return this.messageId;
    }

    getConnectionState() {
        return this.connectionState;
    }

    addIMListener() {
        IMController.addListener('update', this.onUpdate);
        IMController.addListener('clientUpdate', this.onClientUpdate);
    }

    onUpdate = update => {
    };

    onClientUpdate = update => {
        console.log("Appstore", update)
        switch (update['@type']) {
            case 'clientUpdateChatId': {
                const extendedUpdate = {
                    '@type': 'clientUpdateChatId',
                    nextChatId: update.chatId,
                    nextMessageId: update.messageId,
                    previousChatId: this.chatId,
                    previousMessageId: this.messageId
                };

                this.chatId = update.chatId;
                this.messageId = update.messageId;

                console.log("AppStore, clientUpdateChatId", extendedUpdate)
                this.emit('clientUpdateChatId', extendedUpdate);
                break;
            }
            case 'clientUpdateAuthState': {
                if (update.auth_state === AuthStateEnum.STATE_LOGIN) {
                    this.cid = update.uid;
                }
                this.emit(update['@type'], update);
                break;
            }
            default: {
                break;
            }
        }
    }
}

const store = new ApplicationStore();
window.app = store;
export default store;