import React from "react";
import classNames from 'classnames';
import PropTypes from "prop-types";

import ChatStore from '../../Stores/ChatStore';
import ApplicationStore from '../../Stores/ApplicationStore';
import {openChat} from "../../Actions/Client";
import ChatTile from "./ChatTile";
import DialogTitle from "./DialogTitle";
import DialogMeta from "./DialogMeta";
import './Dialog.css';
import DialogContent from "./DialogContent";
import DialogBadge from "./DialogBadge";
import Popover from "@material-ui/core/Popover";
import MenuList from "@material-ui/core/MenuList";
import MenuItem from "@material-ui/core/MenuItem";

class Dialog extends React.Component {
    constructor(props) {
        super(props);
        this.dialog = React.createRef();

        const chat = ChatStore.get(this.props.chatId);
        this.state = {
            chat,
            contextMenu: false,
            left: 0,
            top: 0
        };
    }

    shouldComponentUpdate(nextProps, nextState, nextContext) {
        const { chatId, t, hidden, isLastPinned } = this.props;
        const { contextMenu } = this.state;
        if (nextProps.chatId !== chatId) {
            return true;
        }

        if (nextState.contextMenu !== contextMenu) {
            return true;
        }
        return false;
    }

    componentDidMount() {
        ApplicationStore.on('clientUpdateChatId', this.onClientUpdateChatId);
    }

    componentWillUnmount() {
        ApplicationStore.off('clientUpdateChatId', this.onClientUpdateChatId);
    }

    onClientUpdateChatId = update => {
        const { chatId } = this.props;

        if (chatId === update.previousChatId || chatId === update.nextChatId) {
            this.forceUpdate();
        }
    };

    handleSelect = event => {
        if (event.button === 0) {
            openChat(this.props.chatId);
        }
    };

    handleContextMenu = event => {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }
        const { chatId } = this.props;
        const { contextMenu } = this.state;
        console.log('handleContextMenu: ', chatId)
        if (contextMenu) {
            this.setState({ contextMenu: false });
        } else {
            const left = event.clientX;
            const top = event.clientY;
            const chat = ChatStore.get(chatId);

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

    handleViewInfo = event => {
        this.handleCloseContextMenu(event);

        const { chatId } = this.props;

        openChat(chatId, null, true);
    };

    getViewInfoTitle = () => {
        const {chatId,} = this.props;
        const chat = ChatStore.get(chatId);
        if (!chat || !chat.conv) return;
        switch (chat.conv.getType()) {
            case 0 : {
                return 'Single';
            }
            case 1: {
                return 'Group';
            }
        }
    };

    render() {

        const {chatId} = this.props;
        const { contextMenu, left, top } = this.state;
        const currentChatId = ApplicationStore.getChatId();
        const isSelected = currentChatId === chatId;

        const chat = ChatStore.get(chatId);
        const {extra} = chat;
        return (
            <>
                <div
                    ref={this.dialog}
                    className={classNames(isSelected ? 'dialog-active' : 'dialog', { 'item-selected': isSelected })}
                    onMouseDown={this.handleSelect}
                    onContextMenu={this.handleContextMenu}>
                    <div className='dialog-wrapper'>
                        <ChatTile chatId={chatId} extra={extra}/>
                        <div className='dialog-inner-wrapper'>
                            <div className='tile-first-row'>
                                <DialogTitle chatId={chatId} extra={extra} />
                                <DialogMeta chatId={chatId} />
                            </div>
                            <div className='tile-second-row'>
                                <DialogContent chatId={chatId} />
                                <DialogBadge chatId={chatId} />
                            </div>
                        </div>
                    </div>
                    <Popover
                        open={contextMenu}
                        onClose={this.handleCloseContextMenu}
                        anchorReference='anchorPosition'
                        anchorPosition={{ top, left }}
                        anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'right'
                        }}
                        transformOrigin={{
                            vertical: 'top',
                            horizontal: 'left'
                        }}
                        onMouseDown={e => e.stopPropagation()}>
                        <MenuList classes={{ root: 'menu-list' }} onClick={e => e.stopPropagation()}>
                            <MenuItem onClick={this.handleViewInfo}>{this.getViewInfoTitle()}</MenuItem>
                        </MenuList>
                    </Popover>
                </div>
            </>
        )
    }
}

Dialog.propTypes = {
    chatId: PropTypes.string.isRequired,
};

export default Dialog;