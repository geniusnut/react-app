import * as React from "react";
import classNames from 'classnames';
import withStyles from "@material-ui/core/styles/withStyles";
import ChatStore from '../../Stores/ChatStore';
import ChatDetailsHeader from "./ChatDetailsHeader";
import {isGroupChat, isSingleChat} from "../../Utils/Chat";
import Divider from "@material-ui/core/Divider";
import List from "@material-ui/core/List";
import {withTranslation} from "react-i18next";
import {compose} from "recompose";
import ChatTile from "../Tile/ChatTile";
import DialogTitle from "../Tile/DialogTitle";
import './ChatDetails.css';
import ListItem from "@material-ui/core/ListItem";
import UserControl from "../Tile/UserControl";
import {openUser} from "../../Actions/Client";

const styles = theme => ({
    closeIconButton: {
        margin: '8px -2px 8px 12px'
    },
    nested: {
        // paddingLeft: theme.spacing(4),
    },
    listItem: {
        padding: '11px 22px'
    }
});

class ChatDetails extends React.Component {
    constructor(props) {
        super(props);
        this.chatDetailsListRef = React.createRef();

        const { chatId } = this.props;

        this.state = {
            prevChatId: chatId
        };
    }

    handleOpenUser = userId => {
        openUser(userId);
    };

    render() {
        const {
            chatId,
            onClose,
            className,
        } = this.props;

        const chat = ChatStore.get(chatId);
        if (!chat) {
            return (
                <div className='chat-details'>
                    <ChatDetailsHeader onClose={onClose} />
                    <div ref={this.chatDetailsListRef} className='chat-details-list' />
                </div>
            );
        }
        const backButton = false;
        const isGroup = isGroupChat(chatId);
        const isMe = isSingleChat(chatId);
        const big = true;

        console.log('ChatDetails chat: ', chat)

        const {extra} = chat;

        const items = isMe ? null : chat.conv.getMembersList().map(user => (
            <ListItem button  key={user}>
                <UserControl userId={user} onSelect={this.handleOpenUser} />
            </ListItem>
        ));

        const content = (
            <>
                <ChatDetailsHeader
                    chatId={chatId}
                    backButton={backButton}
                    onClose={onClose}
                    onClick={this.handleHeaderClick}
                />
                <div ref={this.chatDetailsListRef} className='chat-details-list'>
                    <div className='chat-details-info'>
                        <div className={classNames('chat', { 'chat-big': big })} onClick={this.handleClick}>
                            <div className='chat-wrapper'>
                                <ChatTile big={big} chatId={chatId} extra={extra} />
                                <div className='dialog-inner-wrapper'>
                                    <div className='tile-first-row'>
                                        <DialogTitle chatId={chatId} extra={extra}/>
                                    </div>
                                    {isMe && (
                                        <div className='tile-second-row'>
                                            {/*<DialogStatus chatId={chatId} />*/}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                    {(!isMe || isGroup ) && (
                        <>
                            <Divider />
                            <List>
                                {items}
                            </List>
                        </>
                    )}
                </div>
            </>
        )
        return  <div className={classNames('chat-details', className)}>{content}</div>;
    }
}

const enhance = compose(
    withTranslation(),
    withStyles(styles, { withTheme: true }),
);

export default enhance(ChatDetails);