import React from "react";
import Dialog from "../Tile/Dialog";
import ChatStore from "../../Stores/ChatStore"
import './DialogsList.css';

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
    }


    componentWillUnmount() {
        ChatStore.off("queryConv", this.onQueryConv);
        ChatStore.on("tgtMsgSend", this.updateOrder);
    }

    shouldComponentUpdate(nextProps, nextState, nextContext) {
        return true
    }

    scrollToTop() {
        const list = this.listRef.current;
        list.scrollTop = 0;
    }

    handleScroll() {

    }

    onQueryConv = update => {
        const soretedItems = ChatStore.getSortedItems();
        this.setState({chats: soretedItems}, () => this.onLoadNext(true));
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