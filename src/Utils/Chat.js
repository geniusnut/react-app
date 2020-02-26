
import dateFormat from 'dateformat';
import ChatStore from '../Stores/ChatStore';
import {getContent} from "./Message";
import {getPeerCid, getPeerUser, getUser} from "./User";

function isSingleChat(chat) {
    return !chat && chat.getType() === 0;
}

function getChatTitle(chatId, showSavedMessages = false, t = key => key) {
    const chat = ChatStore.get(chatId);
    if (!chat || !chat.conv) return null;
    if (chat.conv.getType() === 1) {
        return chat.conv.getName() || '未命名'
    }
    const user = getPeerUser(chat.conv)
    if (!user) return null;
    return user.nick;
}

function getMessageDate(message) {
    const date = new Date(message.getAckts() / 1000_000);

    const dayStart = new Date();
    dayStart.setHours(0, 0, 0, 0);
    if (date > dayStart) {
        return dateFormat(date, 'H:MM');
    }

    const now = new Date();
    const day = now.getDay();
    const weekStart = now.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(now.setDate(weekStart));
    if (date > monday) {
        return dateFormat(date, 'ddd');
    }

    return dateFormat(date, 'd.mm.yyyy');
}

function getLastMessageDate(chat) {
    if (!chat) return null;
    if (!chat.last_ts) return null;
    // if (showChatDraft(chat.id)) return null;

    return getMessageDate(chat.last_msg);
}

function getLastMessageSenderName(chat) {
    if (!chat) return null;

    return getMessageSenderName(chat.last_msg);
}

function getMessageSenderName(message) {
    if (!message) return null;
    return message.getCid();
}

function getLastMessageContent(chat, t = key => key) {
    if (!chat) return null;

    const { last_msg } = chat;
    if (!last_msg) return null;

    return getContent(last_msg, t);
}

export {
    isSingleChat,
    getChatTitle,
    getLastMessageDate,
    getLastMessageSenderName,
    getLastMessageContent,
}