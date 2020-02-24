import {EventEmitter} from "events";
import IMController from "../Controllers/IMController";

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

    };
    onClientUpdate = update => {

    };
    get(userId) {
        return this.items.get(userId);
    }

    set(user) {
        this.items.set(user.id, user);
    }
}

const store = new UserStore();
window.user = store;
export default store;