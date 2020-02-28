import * as React from "react";
import classNames from 'classnames';
import DialogTitle from "../Tile/DialogTitle";

class HeaderChat extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const { className, chatId, onClick } = this.props;

        return (
            <div className={classNames('header-chat', className)} onClick={onClick}>
                <div className='header-chat-content'>
                    <DialogTitle chatId={chatId} />
                </div>
            </div>
        );
    }
}

export default HeaderChat;