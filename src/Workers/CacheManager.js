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

class CacheManager {
    constructor() {
        // this.worker = new CacheWorker();
        // this.worker.onmessage = this.onWorkerMessage;
        //
        this.handlers = new Map();
        this.messageM = new Map();
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

    async save(key, cache) {
        if (IMController.localStorage) {
            localStorage.setItem(key, JSON.stringify(cache));
        } else {
            await set(key, cache);
        }

        //const store = localforage.createInstance({ name: 'telegram' });
        //await store.setItem(key, cache);
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
        console.log("CacheStore loadMessages ids: ", ids);
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
        await clear();

        //const store = localforage.createInstance({ name: 'telegram' });
        //store.clear();
    }
}

const manager = new CacheManager();
export default manager;
