import React from "react";
import DayMeta from "../message/DayMeta";
import ChatStore from '../../Stores/ChatStore';
import MessageStore, {isOutgoing, StateEnum} from '../../Stores/MessageStore';
import './MessagesList.css';
import Message from "../message/Message";
import {historyEquals} from "../../Utils/Common";
import IMController from '../../Controllers/IMController';

class MessagesList extends React.Component {

    constructor(props) {
        super(props);
        console.log(`MessagesList.ctor chat_id=${props.chatId} message_id=${props.messageId}`);
        this.sessionId = Date.now();
        this.state = {
            history: [],
        };

        this.listRef = React.createRef();
        this.itemsRef = React.createRef();
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        const {chatId, messageId} = this.props;
        const {scrollDownVisible} = this.state;

        if (prevProps.chatId !== chatId || prevProps.messageId !== messageId) {
            this.handleSelectChat(chatId, prevProps.chatId, messageId, prevProps.messageId);
        }
    }

    componentDidMount() {
        MessageStore.on('tgtMsgSend', this.onNewMessage);
        MessageStore.on('msgAck', this.onAckMessage);
        MessageStore.on('clientUpdateCacheLoaded', this.onLoadCache)
        MessageStore.on('msgRead', this.onReadMessage);
        MessageStore.on('clientSendMessage', this.onSendMessage);
    }

    componentWillUnmount() {
        MessageStore.off('tgtMsgSend', this.onNewMessage);
        MessageStore.off('msgAck', this.onAckMessage);
        MessageStore.off('clientUpdateCacheLoaded', this.onLoadCache)
        MessageStore.off('msgRead', this.onReadMessage);
        MessageStore.off('clientSendMessage', this.onSendMessage);
    }

    shouldComponentUpdate(nextProps, nextState, nextContext) {
        const { chatId, messageId, theme } = this.props;
        const { playerOpened, history, dragging, clearHistory, selectionActive, scrollDownVisible } = this.state;

        if (nextProps.chatId !== chatId) {
            console.log('[ml] shouldComponentUpdate chatId');
            return true;
        }
        if (!historyEquals(nextState.history, history)) {
            // console.trace('[ml] shouldComponentUpdate history', nextState.history, history);
            return true;
        }
        return false;
    }

    onNewMessage = update => {
        const { msg } = update;
        const { chatId } = this.props;
        console.log(chatId, msg.getConversationid());
        if (chatId !== msg.getConversationid()) return;
        IMController.readMessage(chatId, msg);

        this.setState({history:MessageStore.getMessages(chatId)})

        this.scrollToBottom();
    };

    onLoadCache = update => {
        const { chatId } = this.props;
        this.setState({history:MessageStore.getMessages(chatId)})

        this.scrollToBottom();
    }

    onSendMessage = update => {
        const { chatId } = this.props;
        this.setState({history:MessageStore.getMessages(chatId)})
        this.scrollToBottom();
    };

    onAckMessage = update => {
        const { chatId } = this.props;
        this.setState({history:MessageStore.getMessages(chatId)})
        this.scrollToBottom();
    }

    onReadMessage = update => {

    }

    async handleSelectChat(chatId, previousChatId, messageId, previousMessageId) {
        const chat = ChatStore.get(chatId);
        const previousChat = ChatStore.get(previousChatId);

        this.readMessages();
    }

    scrollToBottom = () => {
        const { chatId, messageId } = this.props;
        const list = this.listRef.current;

        // console.log(
        //     `MessagesList.scrollToBottom before
        //     chatId=${chatId} messageId=${messageId}
        //     list.scrollTop=${list.scrollTop}
        //     list.offsetHeight=${list.offsetHeight}
        //     list.scrollHeight=${list.scrollHeight}`
        // );

        const nextScrollTop = list.scrollHeight - list.offsetHeight;
        if (nextScrollTop !== list.scrollTop) {
            list.scrollTop = list.scrollHeight - list.offsetHeight;
        }
    };

    scrollToStart = async () => {
    };

    render() {
        const { chatId } = this.props;

        const history = MessageStore.getMessages(chatId);

        this.messages = !history
            ? null
            : history.map((x, i) => {
            const prevMessage = i > 0 ? history[i - 1].msg : null;
            const nextMessage = i < history.length - 1 ? history[i + 1].msg : null;

            console.log("msglist", chatId, x.msg);
            const showDate = this.showMessageDate(x.msg, prevMessage, i === 0);
            const messageId = isOutgoing(x.state) ? x.msg.getJetts() : x.msg.getId();
            const date = x.msg.getId() ? x.msg.getAckts() / 1000_000_000 : x.msg.getJetts();
            console.log("MessagesList render messages:", messageId, x.msg);
            const showTitle = false;
            const showTail = false;
            const showUnreadSeparator = false;

            let m = null;

            if (x.msg) {
                m = (
                    <Message
                        key={`chat_id=${x.msg.getConversationid()} message_id=${messageId}`}
                        ref={el => this.itemsMap.set(i, el)}
                        chatId={x.msg.getConversationid()}
                        messageId={messageId}
                        // sendingState={x.sending_state}
                        showTitle={showTitle}
                        showTail={showTail}
                        showUnreadSeparator={showUnreadSeparator}
                    />
                );
            }
            return (
                <div key={`chat_id=${x.msg.getConversationid()} message_id=${messageId}`}>
                    {showDate && <DayMeta date={date} />}
                    {m}
                </div>
            );
        });

        return (
            <div
                className={'messages-list'}
                onDragEnter={this.handleListDragEnter}>
                <div ref={this.listRef} className='messages-list-wrapper' onScroll={this.handleScroll}>
                    <div className='messages-list-top' />
                    <div ref={this.itemsRef} className='messages-list-items'>
                        {this.messages}
                    </div>
                </div>
            </div>
        );
    }

    showMessageDate(message, prevMessage, isFirst) {
        if (isFirst) {
            return true;
        }

        const date = new Date(message.getAckts() / 1000_000);
        const prevDate = prevMessage ? new Date(prevMessage.getAckts() / 1000_000) : date;

        if (
            date.getFullYear() !== prevDate.getFullYear() ||
            date.getMonth() !== prevDate.getMonth() ||
            date.getDate() !== prevDate.getDate()
        ) {
            return true;
        }

        return false;
    }

    handleListDragEnter = event => {
        event.preventDefault();
        event.stopPropagation();

        const { chatId } = this.props;
        console.log("handleListDragEnter: ", event)
    };

    handleScroll = () => {
    }

    readMessages() {
        const {chatId} = this.props;
        const messages = MessageStore.getMessages(chatId);
        messages.forEach(x => {
            if (x.state === StateEnum.STATE_RECEIPT) {
                IMController.readMessage(chatId, x.msg);
            }
        })
    }
}

export default MessagesList;