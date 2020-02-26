import {EventEmitter} from "events";
import IMController from "../Controllers/IMController";
import {KEY_AUTH_STATE} from "../Constants";


export const AuthStateEnum = Object.freeze({
    STATE_IDLE: 'authorizationStateIdle',
    STATE_WAIT: 'authorizationStateWait',
    STATE_FAILED: 'authorizationStateFailed',
    STATE_LOGIN: 'authorizationStateLogin',
    STATE_LOGOUT: 'authorizationStateLogout',
});

class AuthorizationStore extends EventEmitter {
    constructor() {
        super();

        this.reset();
        this.load();

        this.addIMListener();
        this.setMaxListeners(Infinity);
    }

    onUpdate = update => {
        switch (update['@type']) {
            case 'updateAuthState': {
                const { data:authorization_state } = update;

                this.current = authorization_state;
                console.log("authorization_state: ", authorization_state)
                this.save(authorization_state);

                this.emit(update['@type'], update);
                break;
            }
            default:
                break;
        }
    };

    onClientUpdate = update => {
    };

    addIMListener() {
        IMController.addListener('update', this.onUpdate);
        IMController.addListener('clientUpdate', this.onClientUpdate);
    }

    reset = () => {
        this.current = null;
    };

    load() {
        try {
            const value = localStorage.getItem(KEY_AUTH_STATE);
            if (value) {
                this.current = JSON.parse(value);
            } else {
                this.current = null;
            }
            // IMController.clientUpdate({
            //     '@type': "clientUpdateAuthState",
            //     data: this.current,
            // })
            // this.emit("clientUpdateAuthState", this.current)
        } catch {}
    }

    save(state) {
        if (state) {
            localStorage.setItem(KEY_AUTH_STATE, JSON.stringify(state));
        } else {
            localStorage.removeItem(KEY_AUTH_STATE);
        }
    }
}

const store = new AuthorizationStore();
window.authorization = store;
export default store;