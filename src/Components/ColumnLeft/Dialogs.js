import React from "react";
import classNames from 'classnames';
import './Dialogs.css';
import DialogsList from "../ColumnLeft/DialogsList";
import DialogsHeader from "./DialogsHeader";
import IMController from '../../Controllers/IMController';
import CacheStore from '../../Stores/CacheStore';

class Dialogs extends React.Component {

    constructor(props) {
        super(props);

        this.dialogsHeaderRef = React.createRef();
        this.dialogListRef = React.createRef();
    }

    componentDidMount() {
        this.loadCache();
    }

    async loadCache() {
        const cache = (await CacheStore.loadCache()) || {};

        const { chats, archiveChats } = cache;

        this.setState({
            cache,
        });

        IMController.clientUpdate({
            '@type': 'clientUpdateCacheLoaded'
        });
    }

    handleHeaderClick = () => {
        this.dialogListRef.current.scrollToTop();

    };

    render() {
        return (
            <div className={classNames('dialogs')}>
                <DialogsHeader
                    ref={this.dialogsHeaderRef}
                    onClick={this.handleHeaderClick}
                />
                <div className='dialogs-content'>
                    <DialogsList
                        ref={this.dialogListRef}
                        />
                </div>
            </div>
        );
    }
}

export default Dialogs;