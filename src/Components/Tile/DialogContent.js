import * as React from "react";
import {withTranslation} from "react-i18next";
import ChatStore from '../../Stores/ChatStore';
import './DialogContent.css';
import {getLastMessageContent, getLastMessageSenderName, isSingleChat} from "../../Utils/Chat";

class DialogContent extends React.Component {
    shouldComponentUpdate(nextProps, nextState) {
        const { chatId, t } = this.props;

        if (nextProps.chatId !== chatId) {
            return true;
        }

        if (nextProps.t !== t) {
            return true;
        }

        return false;
    }

    componentDidMount() {
        ChatStore.on('tgtMsgSend', this.onUpdate);
    }

    componentWillUnmount() {
        ChatStore.off('tgtMsgSend', this.onUpdate);
    }

    onUpdate = update => {
        const { chatId } = this.props;

        if (chatId !== update.chatId) return;

        this.forceUpdate();
    };

    render() {
        const { chatId, t } = this.props;

        const chat = ChatStore.get(chatId);

        const content = getLastMessageContent(chat, t) || '\u00A0';
        const senderName = isSingleChat(chat) ? null : getLastMessageSenderName(chat);

        return <div className='dialog-content'>
            {/*{senderName && <span className='dialog-content-accent'>{senderName}: </span>}*/}
            {content}
        </div>;
    }
}

export default withTranslation()(DialogContent);