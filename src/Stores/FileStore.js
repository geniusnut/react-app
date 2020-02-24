import {EventEmitter} from "events";

class FileStore extends EventEmitter {

    constructor() {
        super();
        this.reset();
    }

    reset = () => {

        this.db = null;
        this.urls = new WeakMap();
        this.dataUrls = new Map();
        this.items = new Map();
    };

    getDataUrl = id => {
        if (!id) {
            return null;
        }

        if (this.dataUrls.has(id)) {
            return this.dataUrls.get(id);
        }

        return null;
    };

    getBlobUrl = (blob) => {
        if (!blob) {
            return null;
        }

        if (this.urls.has(blob)) {
            return this.urls.get(blob);
        }
    }
}

const store = new FileStore();
window.file = store;
export default store;