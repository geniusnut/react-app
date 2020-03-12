/*
 *  Copyright (c) 2018-present, Evgeny Nadymov
 *
 * This source code is licensed under the GPL v.3.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
// eslint-disable-next-line import/no-webpack-loader-syntax
// import CacheWorker from './cache.worker'; // eslint-disable-line import/no-webpack-loader-syntax
import {set, get, del, clear, keys, Store} from 'idb-keyval';
import IMController from '../Controllers/IMController';
var msg_pb = require('../gen/msg_pb');
var conv_pb = require('../gen/conversation_pb');

class CacheManager {
    constructor() {
        // this.worker = new CacheWorker();
        // this.worker.onmessage = this.onWorkerMessage;
        //
        this.handlers = new Map();
        this.messageM = new Map();
        this.userStore = new Store('user')
        this.chatStore = new Store('chat')
        this.fileStore = new Store('file')
    }

    onWorkerMessage = event => {
        const { data } = event;
        if (!data) return;

        const { handlerKey, cache } = data;

        const handler = this.handlers.get(handlerKey);
        if (handler) {
            const { command, resolve, reject } = handler;
            switch (command) {
                case 'save': {
                    resolve();
                    break;
                }
                case 'load': {
                    resolve(cache);
                }
            }
        }
    };

    async load(key) {
        if (IMController.localStorage) {
            // console.log('[cm] load (ls)', key);
            const value = localStorage.getItem(key);
            if (!value) return null;

            // console.log('[cm] parse', key);
            const obj = JSON.parse(value);

            // console.log('[cm] finish', key);
            return obj;
        } else {
            // console.log('[cm] load (idb)', key);
            return await get(key);
        }

        //const store = localforage.createInstance({ name: 'telegram' });
        //return await store.getItem(key);
    }

    async loadChats() {
        const m = new Map();
        const ids = (await keys(this.chatStore));
        for (let k of ids) {
            let v = await get(k, this.chatStore)
            if (v && v.conv) {
                v = {...v, conv: conv_pb.Conversation.deserializeBinary(v.conv)}
                if (v.last_msg) {
                    v = {...v, last_msg: msg_pb.Msg.deserializeBinary(v.last_msg)}
                }
            }
            m.set(k, v)
        }
        return m
    }

    async loadFiles() {
        return this.loadStore(this.fileStore)
    }

    async loadUsers() {
        return this.loadStore(this.userStore)
    }

    async loadStore(store) {
        const m = new Map();
        const ids = (await keys(store));
        for (let k of ids) {
            let v = await get(k, store)
            m.set(k, v)
        }
        return m
    }

    async save(key, cache) {
        if (IMController.localStorage) {
            localStorage.setItem(key, JSON.stringify(cache));
        } else {
            await set(key, cache);
        }

        //const store = localforage.createInstance({ name: 'telegram' });
        //await store.setItem(key, cache);
    }

    async saveUser(key, cache) {
        set(key, cache, this.userStore)
    }

    async saveChat(convId, chat) {
        chat = {...chat, conv: chat.conv.serializeBinary()}
        if (chat.last_msg) {
            chat = {...chat, last_msg: chat.last_msg.serializeBinary()}
        }
        set(convId, chat, this.chatStore)
    }

    async saveMessage(convId, key, message) {
        let store = this.messageM.get(convId);

        if (!store) {
            store = new Store('conv_' + convId);
            this.messageM.set(convId, store);
        }
        message = {...message, msg: message.msg.serializeBinary()}
        set(key, message, store)
    }

    async loadMessages(convId) {
        console.log("CacheStore loadMessages ids: ", convId);
        let store = this.messageM.get(convId);
        if (!store) {
            store = new Store('conv_' + convId);
            this.messageM.set(convId, store);
        }

        const m = new Map();
        const ids = (await keys(store));
        for (let id of ids) {
            let message = await get(id, store)
            if (message && message.msg) {
                message = {...message, msg: msg_pb.Msg.deserializeBinary(message.msg)}
            }
            m.set(id, message)
        }
        return m
    }

    async remove(key) {
        await del(key);
    }

    async clear() {
        await clear(this.userStore);
        await clear(this.chatStore);

        //const store = localforage.createInstance({ name: 'telegram' });
        //store.clear();
    }
}

const manager = new CacheManager();
export default manager;
