import {EventEmitter} from "events";
import IMController from "../Controllers/IMController";
import CacheStore from './CacheStore';

class UserStore extends EventEmitter {
    constructor() {
        super();

        this.reset();

        this.addIMListener();
        this.setMaxListeners(Infinity);
    }

    reset = () => {
        this.items = new Map();
        this.fullInfoItems = new Map();
    };

    addIMListener() {
        IMController.addListener('update', this.onUpdate);
        IMController.addListener('clientUpdate', this.onClientUpdate);
    }

    onUpdate = update => {
        switch (update['@type']) {
            case 'updateUser': {
                const {user} = update;
                this.set(user);
                CacheStore.saveUser(user.cid, user);
                this.emit(update['@type'], update);
                break;
            }
        }

    };
    onClientUpdate = update => {
    };

    get(userId) {
        return this.items.get(userId);
    }

    set(user) {
        this.items.set(user.cid, user);
    }
}

const store = new UserStore();
window.user = store;
export default store;