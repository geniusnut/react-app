import React from "react";
import classNames from 'classnames';
import Dialogs from "./ColumnLeft/Dialogs";
import ChatStore from '../Stores/ChatStore';
import ApplicationStore from '../Stores/ApplicationStore';
import DialogDetails from "./ColumnMiddle/DialogDetails";
import IMController from '../Controllers/IMController';
import ChatInfo from "./ColumnRight/ChatInfo";

class MainPage extends React.Component {
    constructor(props) {
        super(props);

        this.dialogDetailsRef = React.createRef();

        this.state = {
            isChatDetailsVisible: ApplicationStore.isChatDetailsVisible,
        };
    }

    componentDidMount() {
        ChatStore.on('clientUpdateOpenChat', this.onClientUpdateOpenChat);

        ApplicationStore.on('clientUpdateChatDetailsVisibility', this.onClientUpdateChatDetailsVisibility);
    }

    componentWillUnmount() {
        ChatStore.off('clientUpdateOpenChat', this.onClientUpdateOpenChat);

        ApplicationStore.off('clientUpdateChatDetailsVisibility', this.onClientUpdateChatDetailsVisibility);
    }

    onClientUpdateChatDetailsVisibility = update => {
        this.setState({
            isChatDetailsVisible: ApplicationStore.isChatDetailsVisible
        });
    };

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
        const {
            isChatDetailsVisible,
        } = this.state;

        return (
            <>
                <div
                    className={classNames('page', {
                        'page-third-column': isChatDetailsVisible
                    })}>
                    <Dialogs />
                    <DialogDetails ref={this.dialogDetailsRef} />
                    {isChatDetailsVisible && <ChatInfo />}
                </div>
            </>
        )
    }
}

export default MainPage;