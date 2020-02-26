import {EventEmitter} from "events";
import IMController from "../Controllers/IMController";

class FileStore extends EventEmitter {

    constructor() {
        super();
        this.reset();

        this.addIMListener();
        this.setMaxListeners(Infinity);
    }

    reset = () => {

        //this.transactionCount = 0;
        this.db = null;
        this.urls = new WeakMap();
        this.dataUrls = new Map();
        this.items = new Map();
    };

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
            case 'downloadFile': {
                const {url, file} = update;
                this.set(url, file)
            }
            default:
                break;
        }
    };

    set(url, file) {
        this.items.set(url, file);
    }

    get(url) {
        return this.items.get(url);
    }

    onClientUpdate = update => {
        switch (update['@type']) {

        }
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

        const url = URL.createObjectURL(blob);
        this.urls.set(blob, url);

        return url;
    }
}

const store = new FileStore();
window.file = store;
export default store;