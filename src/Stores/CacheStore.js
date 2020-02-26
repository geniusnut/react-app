import IMController from "../Controllers/IMController";
import {debounce} from "../Utils/Common";
import CacheManager from '../Workers/CacheManager';
import {EventEmitter} from "events";
import MessageStore from './MessageStore';
import UserStore from './UserStore';
import FileStore from './FileStore';
import ChatStore from './ChatStore';

class CacheStore extends EventEmitter {
    constructor() {
        super();

        this.reset();

        this.addIMListener();
        this.setMaxListeners(Infinity);

        this.saveChatsInternal = debounce(this.saveChatsInternal, 2000);
    }

    reset = () => {
        this.chatIds = [];
    };

    addIMListener() {
        IMController.addListener('update', this.onUpdate);
        IMController.addListener('clientUpdate', this.onClientUpdate);
    }

    onUpdate = update => {
        switch (update['@type']) {
            case 'updateAuthorizationState': {
                const { authorization_state } = update;
                if (!authorization_state) break;

                switch (authorization_state['@type']) {
                    case 'authorizationStateClosed': {
                        this.reset();
                        break;
                    }
                    case 'authorizationStateLoggingOut':
                    case 'authorizationStateWaitCode':
                    case 'authorizationStateWaitPhoneNumber':
                    case 'authorizationStateWaitPassword':
                    case 'authorizationStateWaitRegistration': {
                        CacheManager.remove('cache');
                        CacheManager.remove('files');
                        break;
                    }
                }

                break;
            }
            default:
                break;
        }
    };

    onClientUpdate = update => {

    };

    async loadCache() {
        const promises = [];
        promises.push(CacheManager.loadChats().catch(error => null));
        promises.push(CacheManager.loadUsers().catch(error => null));
        promises.push(CacheManager.loadFiles().catch(error => null));

        const [chats, users, files] = await Promise.all(promises);
        (chats || []).forEach((x, index) => {
            ChatStore.set(x)
        });
        //
        (users || []).forEach((x, index) => {
            UserStore.set(x);
        });
        //
        (files || []).forEach(( x, index) => {
            FileStore.setDataUrl(index, x);
        });
    }

    getCache(chatIds) {
        const fileMap = new Map();
        const userMap = new Map();
        const chats = chatIds.map(x => ChatStore.get(x));

        return {
            chats,
        };
    }

    async saveUser(cid, user) {
            console.log("CacheStore saveUser: ", cid, user)
        CacheManager.saveUser(cid, user)
    }

    async saveChat(chatId, chat) {
        CacheManager.saveChat(chatId, chat)
    }

    saveChats(chatIds) {
        this.chatIds = chatIds;
        this.saveChatsInternal();
    }

    async saveChatsInternal() {
        const cache = this.getCache(this.chatIds);
        await CacheManager.save('cache', cache);
    }

    saveMessage(chatId,messageId, message) {
        this.saveMessageInternal(chatId,messageId, message)
    }

    async saveMessageInternal(chatId,messageId, message) {
        await CacheManager.saveMessage(chatId, messageId, message)
    }

    async loadMessages(chatId) {
        const msgs = await CacheManager.loadMessages(chatId);
        console.log("CacheStore loadMessages", chatId, msgs);
        MessageStore.addMessages(chatId, msgs)
    }
}

const store = new CacheStore();
window.cache = store;
export default store;