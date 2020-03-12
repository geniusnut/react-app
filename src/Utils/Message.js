import React from 'react';
import dateFormat from 'dateformat';
import IMController from '../Controllers/IMController';
import MessageStore, {StateEnum} from '../Stores/MessageStore';
import Photo from "../Components/message/Photo";
var msg_pb = require('../gen/msg_pb');

export function readMessages(chatId, messageIds, forceRead) {
    IMController.send({
        '@type': 'viewMessages',
        chat_id: chatId,
        message_ids: messageIds,
        force_read: forceRead
    });
}

function getText(message, meta) {
    if (!message) return null;

    let result = [];
    switch (message.getType()) {
        case msg_pb.MsgType.TEXT: {
            result = new TextDecoder("utf-8").decode(message.getBlob());
            break
        }
        case msg_pb.MsgType.REDPACKET: {
            result = '[[[收到红包]]]';
            break
        }
        default:
            break;
    }
    return result && result.length > 0 ? [...result, meta]: [];
}

function getMedia(message, openMedia, chatId, messageId) {
    if (!message) return null;

    switch (message.getType()) {
        case msg_pb.MsgType.PICTURE: {
            const image = msg_pb.Image.deserializeBinary(message.getBlob())

            return (
                <Photo
                    type='message'
                    chatId={chatId}
                    messageId={messageId}
                    src={image.getImgurl()}
                    openMedia={openMedia}
                />
            );
        }
    }
    return null;
}

function openMedia(chatId, messageId) {
    const message = MessageStore.get(chatId, messageId);
    if (!message) return;
}

function getContent(message) {
    if (!message) return null;

    return getText(message)
}

function isMessageUnread(chatId, messageId) {

    const message = MessageStore.get(chatId, messageId);
    if (!message) {
        return false;
    }

    return message.state !== StateEnum.STATE_READ;
}

function getDate(date) {
    if (!date) return null;

    const d = new Date(date * 1000);

    return dateFormat(d, 'H:MM'); //date.toDateString();
}

export {
    getText,
    getContent,
    getMedia,
    openMedia,
    isMessageUnread,
    getDate,
};