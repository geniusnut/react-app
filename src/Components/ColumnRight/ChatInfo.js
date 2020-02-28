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
import './ChatInfo.css';

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
    }

    componentWillUnmount() {
        ApplicationStore.off('clientUpdateChatId', this.onClientUpdateChatId);
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

        let content = null;

        let title = 'Chat Info'
        return  (
            <div className={classNames('chat-info', { 'right-column': !popup }, className)}>
                <div className='header-master'>
                    <div className='header-status grow cursor-pointer' onClick={this.handleCloseChatDetails}>
                        <span className='header-status-content'>{title}</span>
                    </div>
                </div>
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

export default ChatInfo;
