import React from "react";
import ChatStore from '../../Stores/ChatStore';
import './DialogBadge.css';


class DialogBadge extends React.Component {
    shouldComponentUpdate(nextProps, nextState) {
        const { chatId } = this.props;

        if (nextProps.chatId !== chatId) {
            return true;
        }

        return false;
    }

    render() {
        const { chatId } = this.props;

        const chat = ChatStore.get(chatId);
        if (!chat) return null;

        return (
            <div className='dialog-badge'>
            </div>
        );
    }
}

export default DialogBadge;