import IMController from '../Controllers/IMController';
import ChatStore from '../Stores/ChatStore';
import AppStore from '../Stores/ApplicationStore';

export function openReply() {
}


export function selectMessage() {
}

export function openUser(userId) {
    if (userId === AppStore.getCid()) return;
    const chatId = ChatStore.findUserChat(userId);
    chatId && openChat(chatId)
}


export function openChat(chatId, messageId = null, popup = false) {
    console.log("Client openChat");
    IMController.clientUpdate({
        '@type': 'clientUpdateOpenChat',
        chatId,
        messageId,
        popup
    });
}