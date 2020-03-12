/*
 *  Copyright (c) 2018-present, Evgeny Nadymov
 *
 * This source code is licensed under the GPL v.3.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { Component } from 'react';
import classNames from 'classnames';
import { compose } from 'recompose';
import { withTranslation } from 'react-i18next';
import CheckMarkIcon from '@material-ui/icons/Check';
import {
    getMedia,
    getText, openMedia,
} from '../../Utils/Message';
import UserTile from '../Tile/UserTile';
import ChatTile from '../Tile/ChatTile';

import {
    openUser,
    openChat,
    selectMessage,
} from '../../Actions/Client';
import { getFitSize, getSize } from '../../Utils/Common';
import { PHOTO_DISPLAY_SIZE, PHOTO_SIZE } from '../../Constants';
import MessageStore from '../../Stores/MessageStore';
import AppStore from '../../Stores/ApplicationStore';
import './Message.css';
import Meta from "./Meta";
import Progress from "./Progress";

class Message extends Component {
    constructor(props) {
        super(props);

        const { chatId, messageId } = this.props;
        this.state = {
            message: MessageStore.get(chatId, messageId),
            selected: false,
            highlighted: false
        };
    }

    shouldComponentUpdate(nextProps, nextState) {
        const { theme, chatId, messageId, sendingState, showUnreadSeparator, showTail, showTitle } = this.props;
        const { contextMenu, selected, highlighted, emojiMatches } = this.state;

        if (nextProps.theme !== theme) {
            // console.log('Message.shouldComponentUpdate true');
            return true;
        }

        if (nextProps.chatId !== chatId) {
            // console.log('Message.shouldComponentUpdate true');
            return true;
        }

        if (nextProps.messageId !== messageId) {
            // console.log('Message.shouldComponentUpdate true');
            return true;
        }

        if (nextProps.sendingState !== sendingState) {
            // console.log('Message.shouldComponentUpdate true');
            return true;
        }

        if (nextProps.showUnreadSeparator !== showUnreadSeparator) {
            // console.log('Message.shouldComponentUpdate true');
            return true;
        }

        if (nextProps.showTail !== showTail) {
            // console.log('Message.shouldComponentUpdate true');
            return true;
        }

        if (nextProps.showTitle !== showTitle) {
            // console.log('Message.shouldComponentUpdate true');
            return true;
        }

        if (nextState.contextMenu !== contextMenu) {
            // console.log('Message.shouldComponentUpdate true');
            return true;
        }

        if (nextState.selected !== selected) {
            // console.log('Message.shouldComponentUpdate true');
            return true;
        }

        if (nextState.highlighted !== highlighted) {
            // console.log('Message.shouldComponentUpdate true');
            return true;
        }

        if (nextState.emojiMatches !== emojiMatches) {
            // console.log('Message.shouldComponentUpdate true');
            return true;
        }

        // console.log('Message.shouldComponentUpdate false');
        return false;
    }

    componentDidMount() {
        MessageStore.on('clientUpdateMessageHighlighted', this.onClientUpdateMessageHighlighted);
        MessageStore.on('clientUpdateMessageSelected', this.onClientUpdateMessageSelected);
        MessageStore.on('clientUpdateClearSelection', this.onClientUpdateClearSelection);
        MessageStore.on('updateMessageContent', this.onUpdateMessageContent);
        MessageStore.on('updateMessageEdited', this.onUpdateMessageEdited);
        MessageStore.on('updateMessageViews', this.onUpdateMessageViews);
    }

    componentWillUnmount() {
        MessageStore.off('clientUpdateMessageHighlighted', this.onClientUpdateMessageHighlighted);
        MessageStore.off('clientUpdateMessageSelected', this.onClientUpdateMessageSelected);
        MessageStore.off('clientUpdateClearSelection', this.onClientUpdateClearSelection);
        MessageStore.off('updateMessageContent', this.onUpdateMessageContent);
        MessageStore.off('updateMessageEdited', this.onUpdateMessageEdited);
        MessageStore.off('updateMessageViews', this.onUpdateMessageViews);
    }

    onClientUpdateClearSelection = update => {
        if (!this.state.selected) return;

        this.setState({ selected: false });
    };

    onClientUpdateMessageHighlighted = update => {
        const { chatId, messageId } = this.props;
        const { selected, highlighted } = this.state;

        if (selected) return;

        if (chatId === update.chatId && messageId === update.messageId) {
            if (highlighted) {
                this.setState({ highlighted: false }, () => {
                    setTimeout(() => {
                        this.setState({ highlighted: true });
                    }, 0);
                });
            } else {
                this.setState({ highlighted: true });
            }
        } else if (highlighted) {
            this.setState({ highlighted: false });
        }
    };

    onClientUpdateMessageSelected = update => {
        const { chatId, messageId } = this.props;
        const { selected } = update;

        if (chatId === update.chatId && messageId === update.messageId) {
            this.setState({ selected, highlighted: false });
        }
    };

    onUpdateMessageEdited = update => {
        const { chat_id, message_id } = update;
        const { chatId, messageId } = this.props;

        if (chatId === chat_id && messageId === message_id) {
            this.forceUpdate();
        }
    };

    onUpdateMessageViews = update => {
        const { chat_id, message_id } = update;
        const { chatId, messageId } = this.props;

        if (chatId === chat_id && messageId === message_id) {
            this.forceUpdate();
        }
    };

    onUpdateMessageContent = update => {
        const { chat_id, message_id } = update;
        const { chatId, messageId } = this.props;
        const { emojiMatches } = this.state;

        if (chatId !== chat_id) return;
        if (messageId !== message_id) return;

        const newEmojiMatches = false;
        if (newEmojiMatches !== emojiMatches) {
            this.setState({ emojiMatches: false});
        } else {
            this.forceUpdate();
        }
    };

    handleSelectUser = userId => {
    };

    handleSelectChat = chatId => {
        openChat(chatId, null, true);
    };

    handleSelection = () => {
        if (!this.mouseDown) return;

        // const selection = window.getSelection().toString();
        // if (selection) return;
        //
        // const { chatId, messageId } = this.props;
        //
        // const selected = !MessageStore.selectedItems.has(`chatId=${chatId}_messageId=${messageId}`);
        // selectMessage(chatId, messageId, selected);
    };

    handleAnimationEnd = () => {
        this.setState({ highlighted: false });
    };

    handleMouseDown = () => {
        this.mouseDown = true;
    };

    handleMouseOver = () => {
        this.mouseDown = false;
    };

    handleMouseOut = () => {
        this.mouseOut = false;
    };

    handleContextMenu = async event => {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }

        const { contextMenu } = this.state;

        if (contextMenu) {
            this.setState({ contextMenu: false });
        } else {
            const left = event.clientX;
            const top = event.clientY;

            this.setState({
                contextMenu: true,
                left,
                top
            });
        }
    };

    handleCloseContextMenu = event => {
        if (event) {
            event.stopPropagation();
        }

        this.setState({ contextMenu: false });
    };


    handleSelect = event => {
        const { chatId, messageId } = this.props;

        this.handleCloseContextMenu(event);

        selectMessage(chatId, messageId, true);
    };

    getMessageStyle(chatId, messageId) {
        const message = MessageStore.get(chatId, messageId);
        if (!message) return null;

        const { content } = message;
        if (!content) return null;

        switch (content['@type']) {
            case 'messageAnimation': {
                const { animation } = content;
                if (!animation) return null;

                const { width, height, thumbnail } = animation;

                const size = { width, height } || thumbnail;
                if (!size) return null;

                const fitSize = getFitSize(size, PHOTO_DISPLAY_SIZE, false);
                if (!fitSize) return null;

                return { width: fitSize.width };
            }
            case 'messagePhoto': {
                const { photo } = content;
                if (!photo) return null;

                const size = getSize(photo.sizes, PHOTO_SIZE);
                if (!size) return null;

                const fitSize = getFitSize(size, PHOTO_DISPLAY_SIZE, false);
                if (!fitSize) return null;

                return { width: fitSize.width };
            }
            case 'messageVideo': {
                const { video } = content;
                if (!video) return null;

                const { thumbnail, width, height } = video;

                const size = { width, height } || thumbnail;
                if (!size) return null;

                const fitSize = getFitSize(size, PHOTO_DISPLAY_SIZE);
                if (!fitSize) return null;

                return { width: fitSize.width };
            }
        }

        return null;
    }

    openMedia = event => {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }

        const { chatId, messageId } = this.props;

        openMedia(chatId, messageId);
    };

    render() {
        const { t, chatId, messageId, showUnreadSeparator, showTail, showTitle } = this.props;
        const { emojiMatches, selected, highlighted, contextMenu, left, top } = this.state;

        const message = MessageStore.get(chatId, messageId);
        console.log("Message: ", messageId, message)
        if (!message) return <div>[empty message]</div>;
        const {state, msg} = message;

        const sender_user_id = message.msg.getCid();
        const is_outgoing = sender_user_id === AppStore.getCid();
        const date = msg.getAckts() ? new Date(msg.getAckts() / 1000_000) : msg.getJetts() / 1000;

        const inlineMeta = (
            <Meta
                className='meta-hidden'
                chatId={chatId}
                messageId={messageId}
                date={date}
            />
        );
        const text = getText(msg, inlineMeta);
        const hasCaption = false; // text !== null && text.length > 0;
        const hasTitle = false; // showTitle || showForward || Boolean(reply_to_message_id);
        const media = getMedia(msg, this.openMedia, chatId, messageId);

        let tile = <UserTile small userId={sender_user_id} onSelect={this.handleSelectUser} />;
        if (showTail) {
            tile = sender_user_id ? (
                <UserTile small userId={sender_user_id} onSelect={this.handleSelectUser} />
            ) : (
                <ChatTile small chatId={chatId} onSelect={this.handleSelectChat} />
            );
        }

        const style = this.getMessageStyle(chatId, messageId);
        const withBubble = true;

        return (
            <div
                className={classNames('message', {
                    'message-out': is_outgoing,
                })}
                onMouseOver={this.handleMouseOver}
                onMouseOut={this.handleMouseOut}
                onMouseDown={this.handleMouseDown}
                onClick={this.handleSelection}
                onAnimationEnd={this.handleAnimationEnd}
                onContextMenu={this.handleContextMenu}>
                <div className='message-body'>
                    <div className='message-padding'>
                        <CheckMarkIcon className='message-select-tick' />
                    </div>
                    <div className={classNames('message-wrapper', {})}>
                        {tile}
                        <div
                            className={classNames('message-content', {
                                'message-bubble': withBubble,
                                'message-bubble-out': withBubble && is_outgoing
                            })}
                            style={style}>
                            {media}
                            <div
                                className={classNames('message-text')}>
                                {text}
                            </div>

                            <Meta
                                className={classNames('meta-text', {
                                    'meta-bubble': false,
                                })}
                                chatId={chatId}
                                messageId={messageId}
                                date={date}
                            />
                        </div>
                        <div className='message-tile-padding' />
                    </div>
                    <div className='message-padding' />
                </div>
            </div>
        );
    }
}

const enhance = compose(
    withTranslation(),
);

export default enhance(Message);
