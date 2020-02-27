/*
 *  Copyright (c) 2018-present, Evgeny Nadymov
 *
 * This source code is licensed under the GPL v.3.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import UserStore from '../../Stores/UserStore';
import AppStore from '../../Stores/ApplicationStore';
import ChatStore from '../../Stores/ChatStore';
import FileStore from '../../Stores/FileStore';
import './UserTile.css';
import UserAvatar from "../../Assets/default_avatar.png";

class UserTile extends Component {
    constructor(props) {
        super(props);

        if (process.env.NODE_ENV !== 'production') {
            this.state = {
                user: UserStore.get(this.props.userId),
                loaded: false
            };
        } else {
            this.state = {
                loaded: false
            };
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (nextProps.userId !== this.props.userId) {
            return true;
        }

        if (nextState.loaded !== this.state.loaded) {
            return true;
        }

        return false;
    }

    componentDidMount() {
        FileStore.on('clientUpdateUserBlob', this.onClientUpdateUserBlob);
        FileStore.on('clientUpdateChatBlob', this.onClientUpdateChatBlob);
        ChatStore.on('updateChatPhoto', this.onUpdateChatPhoto);
        ChatStore.on('updateChatTitle', this.onUpdateChatTitle);
        AppStore.on('clientUpdateCacheLoaded', this.onUpdateCache);
    }

    componentWillUnmount() {
        FileStore.off('clientUpdateUserBlob', this.onClientUpdateUserBlob);
        FileStore.off('clientUpdateChatBlob', this.onClientUpdateChatBlob);
        ChatStore.off('updateChatPhoto', this.onUpdateChatPhoto);
        ChatStore.off('updateChatTitle', this.onUpdateChatTitle);
        AppStore.off('clientUpdateCacheLoaded', this.onUpdateCache);
    }

    onUpdateCache = update => {
        this.forceUpdate()
    }

    onClientUpdateUserBlob = update => {
        const { userId } = this.props;

        if (userId !== update.userId) return;

        if (this.state.loaded) {
            this.setState({ loaded: false });
        } else {
            this.forceUpdate();
        }
    };

    onClientUpdateChatBlob = update => {
        const { userId } = this.props;
        const { chatId } = update;

        const chat = ChatStore.get(chatId);
        if (!chat) return;
        if (!chat.type) return;

        switch (chat.type['@type']) {
            case 'chatTypeBasicGroup':
            case 'chatTypeSupergroup': {
                return;
            }
            case 'chatTypePrivate':
            case 'chatTypeSecret': {
                if (chat.type.user_id !== userId) return;

                if (this.state.loaded) {
                    this.setState({ loaded: false });
                } else {
                    this.forceUpdate();
                }
                break;
            }
            default: {
                break;
            }
        }
    };

    onUpdateChatPhoto = update => {
        const { chat_id } = update;

        const chat = ChatStore.get(chat_id);
        if (!chat || !chat.type) return;
    };

    onUpdateChatTitle = update => {
        const { userId } = this.props;

        const chat = ChatStore.get(update.chat_id);
        if (!chat) return;
        if (!chat.type) return;

        switch (chat.type['@type']) {
            case 'chatTypeBasicGroup':
            case 'chatTypeSupergroup': {
                return;
            }
            case 'chatTypePrivate':
            case 'chatTypeSecret': {
                if (chat.type.user_id !== userId && !chat.photo) return;

                this.forceUpdate();
            }
        }
    };

    handleSelect = event => {
        const { userId, onSelect } = this.props;
        if (!onSelect) return;

        event.stopPropagation();
        onSelect(userId);
    };

    handleLoad = () => {
        this.setState({ loaded: true });
    };

    render() {
        const { userId, small } = this.props;
        const { loaded } = this.state;

        const user = UserStore.get(userId);
        const src = user && user.avatar ? user.avatar : UserAvatar;
        const tileLoaded = src && loaded;

        return (
            <div
                className={classNames(
                    'user-tile',
                    { 'tile-small': small }
                )}
                onClick={this.handleSelect}>
                {!tileLoaded && (
                    <div className='tile-photo' src={UserAvatar}/>
                )}
                {src && <img className='tile-photo' src={src} onLoad={this.handleLoad} draggable={false} alt='' />}
            </div>
        );
    }
}

UserTile.propTypes = {
    userId: PropTypes.string.isRequired,
    firstName: PropTypes.string,
    lastName: PropTypes.string,
    onSelect: PropTypes.func,
    small: PropTypes.bool
};

export default UserTile;
