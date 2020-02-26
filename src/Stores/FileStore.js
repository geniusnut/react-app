import {EventEmitter} from "events";
import IMController from "../Controllers/IMController";

class FileStore extends EventEmitter {

    constructor() {
        super();
        this.reset();

        this.addIMListener();
        this.setMaxListeners(Infinity);
    }

    addIMListener() {
        IMController.addListener('update', this.onUpdate);
        IMController.addListener('clientUpdate', this.onClientUpdate);
    }

    onUpdate = async update => {
        switch (update['@type']) {
            case 'updateFile': {
                this.set(update.file);

                this.onUpdateFile(update);

                this.emit(update['@type'], update);
                break;
            }
            default:
                break;
        }
    };

    onClientUpdate = update => {
        switch (update['@type']) {

        }
    }
    reset = () => {

        this.db = null;
        this.urls = new WeakMap();
        this.dataUrls = new Map();
        this.items = new Map();
    };

    setDataUrl = (id, dataUrl) => {
        this.dataUrls.set(id, dataUrl);
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