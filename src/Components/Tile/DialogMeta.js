/*
 *  Copyright (c) 2018-present, Evgeny Nadymov
 *
 * This source code is licensed under the GPL v.3.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { getLastMessageDate } from '../../Utils/Chat';
import ChatStore from '../../Stores/ChatStore';
import './DialogMeta.css';

class DialogMeta extends React.Component {
    shouldComponentUpdate(nextProps, nextState) {
        const { chatId } = this.props;

        if (nextProps.chatId !== chatId) {
            return true;
        }

        return false;
    }

    componentDidMount() {
        ChatStore.on('tgtMsgSend', this.onUpdate);
        ChatStore.on('updateChatLastMessage', this.onUpdate);
        ChatStore.on('updateChatReadInbox', this.onUpdate);
        ChatStore.on('updateChatUnreadMentionCount', this.onUpdate);
        ChatStore.on('updateMessageMentionRead', this.onUpdate);
    }

    componentWillUnmount() {

        ChatStore.off('tgtMsgSend', this.onUpdate);
        ChatStore.off('updateChatLastMessage', this.onUpdate);
        ChatStore.off('updateChatReadInbox', this.onUpdate);
        ChatStore.off('updateChatUnreadMentionCount', this.onUpdate);
        ChatStore.off('updateMessageMentionRead', this.onUpdate);
    }

    onClientUpdateClearHistory = update => {
        const { chatId } = this.props;

        if (chatId === update.chatId) {
            this.clearHistory = update.inProgress;
            this.forceUpdate();
        }
    };

    onFastUpdatingComplete = update => {
        this.forceUpdate();
    };

    onUpdate = update => {

        const { chatId } = this.props;

        if (chatId !== update.chatId) return;

        this.forceUpdate();
    };

    render() {
        if (this.clearHistory) return null;

        const { chatId } = this.props;

        const chat = ChatStore.get(chatId);
        if (!chat) return null;

        const { last_msg } = chat;
        if (!last_msg) return null;
        console.log("dialogmeta", chat);

        const date = getLastMessageDate(chat);
        if (!date) return null;

        return (
            <div className='dialog-meta'>
                {date}
            </div>
        );
    }
}

export default DialogMeta;
