import React from "react";
import MessagesList from "./MessagesList";
import AppStore from '../../Stores/ApplicationStore';
import Header from './Header';
import './DialogDetails.css';
import InputboxControl from "./InputboxControl";
import CacheStore from "../../Stores/CacheStore";
import IMController from "../../Controllers/IMController";

class DialogDetails extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            chatId: AppStore.getChatId(),
            messageId: AppStore.getMessageId(),
            selectedCount: 0
        };
    }

    shouldComponentUpdate(nextProps, nextState) {
        const { chatId, messageId, selectedCount } = this.state;
        if (nextState.chatId !== chatId) {
            return true;
        }
        if (nextState.messageId !== messageId) {
            return true;
        }
        if (nextState.selectedCount !== selectedCount) {
            return true;
        }

        return false;
    }

    componentDidMount() {
        AppStore.on('clientUpdateChatId', this.onClientUpdateChatId);
    }

    componentWillUnmount() {
        AppStore.off('clientUpdateChatId', this.onClientUpdateChatId);
    }

    async loadCache() {
        const cache = (await CacheStore.loadMessages(this.state.chatId)) || {};

        IMController.clientUpdate({
            '@type': 'clientUpdateMessagesLoaded'
        });
    }

    onClientUpdateChatId = update => {
        this.setState({
            chatId: update.nextChatId,
            messageId: update.nextMessageId
        });
    };

    scrollToBottom = () => {
        this.messagesList.scrollToBottom();
    };

    scrollToStart = () => {
        this.messagesList.scrollToStart();
    };

    scrollToMessage = () => {
        this.messagesList.scrollToMessage();
    };

    render() {
        this.loadCache();
        const { chatId, messageId, selectedCount } = this.state;

        return (
            <div
                className={'dialog-details'}>
                <Header chatId={chatId} />
                <MessagesList ref={ref => (this.messagesList = ref)} chatId={chatId} messageId={messageId} />
                <InputboxControl />
            </div>);
    }
}

export default DialogDetails;