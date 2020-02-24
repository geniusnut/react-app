import React from "react";
import classNames from 'classnames';
import * as PropTypes from "prop-types";
import {getSrc} from "../../Utils/File";
import ChatStore from '../../Stores/ChatStore';
import './ChatTile.css';

class ChatTile extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            loaded: false
        };
    }

    shouldComponentUpdate(nextProps, nextState) {
        const { chatId } = this.props;
        const { loaded } = this.state;

        if (nextProps.chatId !== chatId) {
            return true;
        }

        if (nextState.loaded !== loaded) {
            return true;
        }

        return false;
    }

    handleLoad = () => {
        this.setState({ loaded: true });
    };

    render() {
        const { chatId, showOnline, showSavedMessages, onSelect, small, big, size } = this.props;

        const chat = ChatStore.get(chatId);
        // const { photo } = chat;
        // const src = getSrc(photo ? photo.small : null);
        return (
            <div
                className={classNames('chat-tile')}>
                {/*{src && <img className='tile-photo' src={src} onLoad={this.handleLoad} draggable={false} alt='' />}*/}
            </div>
        )
    }
}

ChatTile.propTypes = {
    chatId: PropTypes.number.isRequired
};

export default ChatTile;