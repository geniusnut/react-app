import React from "react";
import ChatStore from '../../Stores/ChatStore';
import MessageStore from '../../Stores/MessageStore';
import './DialogBadge.css';


class DialogBadge extends React.Component {
    shouldComponentUpdate(nextProps, nextState) {
        const { chatId } = this.props;

        if (nextProps.chatId !== chatId) {
            return true;
        }

        return false;
    }
    componentDidMount() {
        MessageStore.on('tgtMsgSend', this.onNewMessage)
        MessageStore.on('msgRead', this.onUpdateMessage)
    }

    componentWillUnmount() {
        MessageStore.off('tgtMsgSend', this.onNewMessage)
        MessageStore.off('msgRead', this.onUpdateMessage)
    }

    onNewMessage = update => {
        const { chatId } = this.props;
        if (!update.msg) return;
        if (update.msg.getConversationid() !== chatId) return;

        this.forceUpdate();
    };

    onUpdateMessage = update => {
        const { chatId } = this.props;
        const {chatId: chat_id} = update;

        if (chat_id !== chatId) return;

        this.forceUpdate();
    };

    render() {
        const { chatId } = this.props;

        const chat = ChatStore.get(chatId);
        if (!chat) return null;

        const unread_count = MessageStore.getUnreadByChatId(chatId)
        const showUnreadCount = unread_count > 0;

        return (
            <>
                {showUnreadCount && (<div className='dialog-badge'>
                    <span className='dialog-badge-text'>{unread_count > 0 ? unread_count : ''}</span>
                </div>)}
            </>
        );
    }
}

export default DialogBadge;