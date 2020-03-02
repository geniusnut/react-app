import React from "react";
import Dialog from "../Tile/Dialog";
import ChatStore from "../../Stores/ChatStore"
import './DialogsList.css';
import {SCROLL_PRECISION} from "../../Constants";

class DialogsList extends React.Component {
    constructor(props) {
        super(props);

        this.listRef = React.createRef();

        this.state = {
            chats: null,
            fistSliceLoaded: false
        };
    }

    componentDidMount() {
        ChatStore.on("queryConv", this.onQueryConv);
        ChatStore.on("tgtMsgSend", this.updateOrder);
        ChatStore.on("msgAcked", this.updateOrder);
    }


    componentWillUnmount() {
        ChatStore.off("queryConv", this.onQueryConv);
        ChatStore.on("tgtMsgSend", this.updateOrder);
        ChatStore.on("msgAcked", this.updateOrder);
    }

    getSnapshotBeforeUpdate(prevProps, prevState) {
        const { current: list } = this.listRef;
        if (!list) return { scrollTop: 0 };

        return { scrollTop: list.scrollTop };
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        const { current: list } = this.listRef;
        if (!list) return;

        const { scrollTop } = snapshot;

        list.scrollTop = scrollTop;
    }

    scrollToTop() {
        const list = this.listRef.current;
        list.scrollTop = 0;
    }

    handleScroll= () => {
        const list = this.listRef.current;

        if (list && list.scrollTop + list.offsetHeight >= list.scrollHeight - SCROLL_PRECISION) {
            this.onLoadNext();
        }
    }

    onQueryConv = update => {
        const sortedItems = ChatStore.getSortedItems();
        this.setState({chats: sortedItems}, () => this.onLoadNext(true));
    };

    render() {
        const { chats } = this.state;
        let dialogs = null;
        if (chats) {
            dialogs = chats.map(x => (
                <Dialog key={x} chatId={x} />
            ));
        }

        return (
            <div ref={this.listRef} className='dialogs-list' onScroll={this.handleScroll}>
                {dialogs}
            </div>
        );
    }

    onLoadNext(b) {

    }

    updateOrder = update => {
        const soretedItems = ChatStore.getSortedItems();
        this.setState({chats: soretedItems}, () => this.onLoadNext(true));
    }
}

export default DialogsList;