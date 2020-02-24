
import dateFormat from 'dateformat';
import ChatStore from '../Stores/ChatStore';
import {getContent} from "./Message";

function getChatTitle(chatId, showSavedMessages = false, t = key => key) {
    const chat = ChatStore.get(chatId);
    if (!chat) return null;
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
    getChatTitle,
    getLastMessageDate,
    getLastMessageSenderName,
    getLastMessageContent,
}