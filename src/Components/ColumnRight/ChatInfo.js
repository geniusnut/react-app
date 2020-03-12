/*
 *  Copyright (c) 2018-present, Evgeny Nadymov
 *
 * This source code is licensed under the GPL v.3.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import ApplicationStore from '../../Stores/ApplicationStore';
import ChatStore from '../../Stores/ChatStore';
import './ChatInfo.css';
import CloseIcon from '@material-ui/icons/Close';
import {getChatTitle, isSingleChat} from "../../Utils/Chat";
import IconButton from "@material-ui/core/IconButton";
import withStyles from "@material-ui/core/styles/withStyles";
import {compose} from "recompose";
import ChatTile from "../Tile/ChatTile";
import ChatDetails from "./ChatDetails";

const styles = {
    leftIconButton: {
        margin: '8px -2px 8px 12px'
    },
    rightIconButton: {
        margin: '8px 12px 8px -2px'
    }
};

class ChatInfo extends React.Component {
    constructor(props) {
        super(props);

        // console.log('ChatDetails.ChatInfo.ctor');

        this.detailsRef = React.createRef();

        const { popup } = props;
        const { chatId, dialogChatId } = ApplicationStore;

        this.state = {
            chatId: popup ? dialogChatId : chatId,
        };
    }

    componentDidMount() {
        // console.log('ChatDetails.ChatInfo.componentDidMount');
        this.loadContent(this.state.chatId);

        ApplicationStore.on('clientUpdateChatId', this.onClientUpdateChatId);
        ChatStore.on('groupInfo', this.onGroupInfo);
    }

    componentWillUnmount() {
        ApplicationStore.off('clientUpdateChatId', this.onClientUpdateChatId);
        ChatStore.off('groupInfo', this.onGroupInfo);
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        const { chatId } = this.state;
        if (chatId !== prevState.chatId) {
            this.loadContent(chatId);
        }
    }

    loadContent(chatId) {
    }

    onClientUpdateChatId = update => {
        const { popup } = this.props;
        const { chatId } = this.state;

        if (popup) return;
        if (chatId === update.nextChatId) return;

        this.setState({
            chatId: update.nextChatId,
        });
    };

    onGroupInfo = update => {
        const {conv} = update;
        const {chatId} = this.state;
        if (!conv && conv.getId() !== chatId) return;
        this.forceUpdate();
    }

    handleCloseChatDetails = () => {
        const { popup } = this.props;
        const { userChatId } = this.state;

        if (userChatId) {
            this.setState({ userChatId: null });
        } else {
            ApplicationStore.changeChatDetailsVisibility(false);
        }
    };

    render() {
        const { classes, className, popup } = this.props;
        const {
            chatId,
        } = this.state;

        const chat = ChatStore.get(chatId);
        const {type, conv, id} = chat;
        let title = getChatTitle(chatId);
        let info = type === 0 ? 'Info' : 'Group Info';
        const big = true;
        const content = (
            <ChatDetails
                chatId={chatId}
                popup={popup}
                onClose={this.handleCloseChatDetails}
            />
        )
        return  (
            <div className={classNames('chat-info', { 'right-column': !popup }, className)}>
                {content}
            </div>
        );
    }
}

ChatInfo.propTypes = {
    className: PropTypes.string,
    classes: PropTypes.object,
    popup: PropTypes.bool
};

ChatInfo.defaultProps = {
    className: null,
    classes: null,
    popup: false
};

const enhance = compose(
    withStyles(styles, { withTheme: true })
);

export default enhance(ChatInfo);
