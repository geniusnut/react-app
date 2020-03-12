import React from "react";
import classNames from 'classnames';
import './Dialogs.css';
import DialogsList from "../ColumnLeft/DialogsList";
import DialogsHeader from "./DialogsHeader";
import IMController from '../../Controllers/IMController';
import CacheStore from '../../Stores/CacheStore';
import AppStore from '../../Stores/ApplicationStore';

class Dialogs extends React.Component {

    constructor(props) {
        super(props);

        const { isChatDetailsVisible } = AppStore;

        this.dialogsHeaderRef = React.createRef();
        this.dialogListRef = React.createRef();
        this.state = {
            isChatDetailsVisible,
        }
    }

    shouldComponentUpdate(nextProps, nextState, nextContext) {
        const {
            isChatDetailsVisible,
        } = this.state;

        if (nextState.isChatDetailsVisible !== isChatDetailsVisible) {
            return true;
        }
    }

    componentDidMount() {
        this.loadCache();

        AppStore.on('clientUpdateChatDetailsVisibility', this.onClientUpdateChatDetailsVisibility);
    }

    componentWillUnmount() {
        AppStore.off('clientUpdateChatDetailsVisibility', this.onClientUpdateChatDetailsVisibility);
    }

    async loadCache() {
        const cache = (await CacheStore.loadCache()) || {};

        this.setState({
            cache,
        });

        IMController.clientUpdate({
            '@type': 'clientUpdateCacheLoaded'
        });
    }

    onClientUpdateChatDetailsVisibility = update => {
        const { isChatDetailsVisible } = AppStore;

        this.setState({ isChatDetailsVisible });
    };

    handleHeaderClick = () => {
        this.dialogListRef.current.scrollToTop();
    };

    render() {
        const {
            isChatDetailsVisible,
        } = this.state;
        return (
            <div className={classNames('dialogs', {
                'dialogs-third-column': isChatDetailsVisible
            })}>
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