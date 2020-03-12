/*
 *  Copyright (c) 2018-present, Evgeny Nadymov
 *
 * This source code is licensed under the GPL v.3.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import PropTypes from 'prop-types';
import ErrorIcon from '../../Assets/Icons/Error';
import PendingIcon from '../../Assets/Icons/Pending';
import SentIcon from '../../Assets/Icons/Sent';
import SucceededIcon from '../../Assets/Icons/Succeeded';
import { isMessageUnread } from '../../Utils/Message';
import MessageStore, {StateEnum} from '../../Stores/MessageStore';
import './Status.css';

class Status extends React.Component {
    state = {};

    static getDerivedStateFromProps(props, state) {
        const { chatId, messageId } = props;

        const message = MessageStore.get(chatId, messageId);
        const sendingState = message ? message.state : null;

        if (chatId !== state.prevChatId || messageId !== state.prevMessageId) {
            return {
                prevChatId: chatId,
                prevMessageId: messageId,
                sendingState,
                unread: isMessageUnread(chatId, messageId)
            };
        }

        return null;
    }

    componentDidMount() {
        MessageStore.on('msgAck', this.onUpdateMessageSend);
        MessageStore.on('msgRead', this.onUpdateMessageSend);
        MessageStore.on('msgHasRead', this.onUpdateMessageSend);
    }

    componentWillUnmount() {
        MessageStore.off('msgAck', this.onUpdateMessageSend);
        MessageStore.off('msgRead', this.onUpdateMessageSend);
        MessageStore.off('msgHasRead', this.onUpdateMessageSend);
    }

    onUpdateMessageSend = update => {
        const { chatId, messageId } = this.props;
        const message = MessageStore.get(chatId, messageId);
        const { msgId: updateMsgId, chatId: updateChatId } = update;

        if (chatId !== updateChatId) return;
        if (message.msg.getId() !== updateMsgId) return;
        console.log("onUpdateMessageSend", update);

        this.forceUpdate()
        // this.setState({ sendingState: sending_state });
    };

    render() {
        const { chatId, messageId } = this.props;
        const message = MessageStore.get(chatId, messageId);
        if (!message) return null;
        console.log("Status: ", message)

        switch (message.state) {
            case StateEnum.STATE_SEND:
                return <PendingIcon
                    className='status'
                    viewBox='0 0 14 14'
                    style={{ width: 16, height: 12, transform: 'translate(0, 1px)', stroke: 'currentColor' }}
                />;
            case StateEnum.STATE_ACK:
                return <SentIcon className='status' viewBox='0 0 12 10' style={{ width: 16, height: 9 }} />;
            case StateEnum.STATE_READ:
                return <SucceededIcon className='status' viewBox='0 0 17 10' style={{ width: 16, height: 9 }} />;
        }
        return null;
    }
}

Status.propTypes = {
    chatId: PropTypes.number.isRequired,
    messageId: PropTypes.number.isRequired
};

export default Status;
