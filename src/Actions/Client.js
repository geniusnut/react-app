import IMController from '../Controllers/IMController';

export function openReply() {
}


export function selectMessage() {
}


export function openUser() {
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