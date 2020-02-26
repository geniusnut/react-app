import React from "react";
import classNames from 'classnames';
import * as PropTypes from "prop-types";
import {getSrc} from "../../Utils/File";
import ChatStore from '../../Stores/ChatStore';
import UserStore from '../../Stores/UserStore';
import './ChatTile.css';
import GroupAvatar from '../../Assets/im_group_avatar.png'
import UserAvatar from '../../Assets/default_avatar.png'
import {getUser} from "../../Utils/User";

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

    componentDidMount() {
        UserStore.on('updateUser', this.updateUser);
    }

    componentWillUnmount() {
        UserStore.off('updateUser', this.updateUser);
    }

    updateUser = update => {
        console.log("chattile updateUser: ", this.props.extra, update)
        if (this.props.extra !== update.user.cid) {
            return
        }
        this.forceUpdate();
    }

    handleLoad = () => {
        this.setState({ loaded: true });
    };

    render() {
        const { chatId } = this.props;
        const { loaded } = this.state;

        const chat = ChatStore.get(chatId);
        const { type, extra } = chat;
        const src = type === 0 ? this.getSingleCover() : this.getGroupCover();

        const tileLoaded = src && loaded;

        const tileColor = `tile_color_${(Math.abs(chatId) % 8) + 1}`;
        return (
            <div
                className={classNames('chat-tile',
                    { [tileColor]: !tileLoaded }
                )}>
                {src && <img className='tile-photo' src={src} onLoad={this.handleLoad} draggable={false} alt='' />}
            </div>
        )
    }

    getSingleCover() {
        const extra = this.props.extra;
        const user = getUser(extra);
        return user !== null ? user.avatar : UserAvatar;
    }

    getGroupCover() {
        return GroupAvatar
    }
}

ChatTile.propTypes = {
    chatId: PropTypes.string.isRequired,
    extra: PropTypes.string.isRequired
};

export default ChatTile;