import React from 'react';
import IMController from '../Controllers/IMController';
import MessageStore from '../Stores/MessageStore';
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

    switch (message.getType()) {
        case msg_pb.MsgType.TEXT: {
            return new TextDecoder("utf-8").decode(message.getBlob());
        }
        case msg_pb.MsgType.REDPACKET: {
            return '[[[收到红包]]]';
        }
        default:
            break;
    }
    return null;
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

export {
    getText,
    getContent,
    getMedia,
    openMedia,
};