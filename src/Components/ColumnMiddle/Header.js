import React from "react";
import AppStore from '../../Stores/ApplicationStore';
import ChatStore from '../../Stores/ChatStore';
import MainMenuButton from "./MainMenuButton";
import classNames from 'classnames';
import HeaderChat from "./HeaderChat";
import './Header.css';


class Header extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            connectionState: AppStore.getConnectionState(),
            openDeleteDialog: false
        };
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (nextState !== this.state) {
            return true;
        }

        return false;
    }

    openChatDetails = () => {
        const chatId = AppStore.getChatId();
        const chat = ChatStore.get(chatId);
        if (!chat) return;

        AppStore.changeChatDetailsVisibility(true);
    };

    render() {
        const chatId = AppStore.getChatId();
        const chat = ChatStore.get(chatId);

        return (
            <div className={'header'}>
                <HeaderChat
                    className={classNames('grow', 'cursor-pointer')}
                    chatId={chatId}
                    onClick={this.openChatDetails}
                />
                <MainMenuButton openChatDetails={this.openChatDetails} />
            </div>
        )
    }
}

export default Header;