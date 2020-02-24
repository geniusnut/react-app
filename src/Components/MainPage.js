import React from "react";
import classNames from 'classnames';
import Dialogs from "./ColumnLeft/Dialogs";
import ChatStore from '../Stores/ChatStore';
import ApplicationStore from '../Stores/ApplicationStore';
import DialogDetails from "./ColumnRight/DialogDetails";
import IMController from '../Controllers/IMController';

class MainPage extends React.Component {
    constructor(props) {
        super(props);

        this.dialogDetailsRef = React.createRef();
    }

    componentDidMount() {
        ChatStore.on('clientUpdateOpenChat', this.onClientUpdateOpenChat);
    }

    componentWillUnmount() {
        ChatStore.off('clientUpdateOpenChat', this.onClientUpdateOpenChat);
    }

    onClientUpdateOpenChat = update => {
        const { chatId, messageId, popup } = update;

        this.handleSelectChat(chatId, messageId, popup);
    };

    handleSelectChat = (chatId, messageId = null, popup = false) => {
        const currentChatId = ApplicationStore.getChatId();
        const currentDialogChatId = ApplicationStore.dialogChatId;
        const currentMessageId = ApplicationStore.getMessageId();

        if (currentChatId === chatId && messageId && currentMessageId === messageId) {
            this.dialogDetailsRef.current.scrollToMessage();
            if (messageId) {
            }
        } else if (currentChatId === chatId && !messageId) {
            this.dialogDetailsRef.current.scrollToStart();
        } else {
            this.dialogDetailsRef.current.scrollToBottom();
            IMController.setChatId(chatId, messageId);
        }
    };

    render() {
        return (
            <>
                <div
                    className={classNames('page')}>
                    <Dialogs />
                    <DialogDetails ref={this.dialogDetailsRef} />
                </div>
            </>
        )
    }
}

export default MainPage;