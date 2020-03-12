import {EventEmitter} from "events";
import IMController from "../Controllers/IMController";
import MessageStore from './MessageStore'
import {APP_NAME} from "../Constants";

class NotificationStore extends EventEmitter {
    constructor() {
        super();

        this.reset();
        this.addIMListener();
        this.setMaxListeners(Infinity);
    }

    reset = () => {
        // depends on ChatStore and MessageStore updates

        this.appInactive = false;
        this.newMessages = new Map();
        this.settings = new Map();
        this.windowFocused = true;
        this.timerHandler = null;
    };

    addIMListener() {
        IMController.addListener('update', this.onUpdate);
        IMController.addListener('clientUpdate', this.onClientUpdate);
    }

    onClientUpdate = update => {
        switch (update['@type']) {
            case 'clientUnreadMessage': {
                this.appInactive = true;
                this.newMessages = new Map();
                this.updateTimer();
                break;
            }
            case 'clientUpdateFocusWindow': {
                const { focused } = update;
                console.log('[ns] clientUpdateFocusWindow', update);

                this.windowFocused = focused;
                if (focused) {
                    this.newMessages = new Map();
                    this.updateTimer();
                }

                break;
            }
        }
    }

    onUpdate = update => {
    }

    getUnreadCount() {
        return MessageStore.getUnread()

    }

    updateTimer() {
        const unreadCount = this.getUnreadCount();
        console.log('[ns] updateTimer', unreadCount, this.newMessages);

        if (unreadCount > 0) {
            if (!this.timerHandler) {
                // console.log('[ns] setInterval');

                this.onTimer();
                this.timerHandler = setInterval(this.onTimer, 1000);
            }
        } else {
            if (this.timerHandler) {
                // console.log('[ns] clearInterval');

                clearInterval(this.timerHandler);
                this.timerHandler = null;
                this.onTimer();
            }
        }
    }

    onTimer = () => {
        console.log('[ns] onTimer');

        const unreadCount = this.getUnreadCount();
        const showBadge = document.title === APP_NAME && unreadCount > 0;

        if (showBadge) {
            let title = '+99 notifications';
            if (unreadCount === 1) {
                title = '1 notification';
            } else if (unreadCount < 99) {
                title = `${unreadCount} notifications`;
            }
            document.title = title;
            document.getElementById('favicon').href = 'favicon_unread.ico';
        } else {
            document.title = APP_NAME + (this.appInactive ? ': Zzz…' : '');
            document.getElementById('favicon').href = 'favicon.ico';
        }
    };
}

const store = new NotificationStore();
window.notifications = store;
export default store;
