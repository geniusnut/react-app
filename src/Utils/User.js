
import UserStore from '../Stores/UserStore';
import AppStore from '../Stores/ApplicationStore';
import AuthStore, {AuthStateEnum} from '../Stores/AuthorizationStore';
import IMController from '../Controllers/IMController';

function updateUser(cid) {
    const {auth_state, access_token, uid, open_id} = AuthStore.current
    if (auth_state !== AuthStateEnum.STATE_LOGIN) {
        console.error("auth_state failed", auth_state)
    }
    IMController.getUser(uid, access_token, open_id, cid)
}

function getUser(cid) {
    if (!AppStore.cacheLoaded) return null
    const user = UserStore.get(cid)
    console.log("getUser", cid, user, UserStore.items)
    if (user) {
        return user
    }
    updateUser(cid)
    return null
}

function getPeerCid(conv) {
    if (conv == null || conv.getType() !== 0) return null;
    if (!IMController.state.cid) return null;
    return conv.getCidsList().find(cid => {
        return IMController.state.cid !== cid
    })
}

function getPeerUser(conv) {
    const cid = getPeerCid(conv)
    if (!cid) return null;
    return getUser(cid);
}

export {
    getUser,
    getPeerCid,
    getPeerUser,
}