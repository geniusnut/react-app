import IMController from '../Controllers/IMController';
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

            return new TextDecoder("utf-8").decode(message.getBlob());
        }
        case msg_pb.MsgType.PICTURE: {
            return '[[[[[[[PICTURE]]]]]]';
        }
    }
}

function getContent(message) {
    if (!message) return null;

    return getText(message)
}

export {
    getText,
    getContent,
};