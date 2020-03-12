import React from "react";
import IconButton from "@material-ui/core/IconButton";
import AppStore from '../../Stores/ApplicationStore';
import ChatStore from '../../Stores/ChatStore';
import SendIcon from '../../Assets/Icons/Send';
import './InputBoxControl.css';
import IMController from '../../Controllers/IMController';
import AttachButton from "./AttachButton";

var msg_pb = require('../../gen/msg_pb');

class InputboxControl extends React.Component {
    constructor(props) {
        super(props);

        this.attachDocumentRef = React.createRef();
        this.attachPhotoRef = React.createRef();
        this.newMessageRef = React.createRef();

        const chatId = AppStore.getChatId();

        this.state = {
            chatId,
        };
    }

    componentDidMount() {
        AppStore.on('clientUpdateChatId', this.onClientUpdateChatId);
    }

    componentWillUnmount() {
        AppStore.off('clientUpdateChatId', this.onClientUpdateChatId);
    }

    onClientUpdateChatId = update => {
        const {chatId} = this.state;
        if (chatId === update.nextChatId) return;

        this.setState(
            {
                chatId: update.nextChatId,
            })
    };

    handleKeyDown = event => {
        const { altKey, ctrlKey, keyCode, metaKey, repeat, shiftKey } = event;

        // console.log('[k] handleKeyDown', altKey, ctrlKey, keyCode, metaKey, repeat, shiftKey);

        switch (keyCode) {
            // enter
            case 13: {
                if (!altKey && !ctrlKey && !metaKey && !shiftKey) {
                    if (!repeat) this.handleSubmit();

                    event.preventDefault();
                    event.stopPropagation();
                }
                break;
            }
            // esc
            case 27: {
                if (!altKey && !ctrlKey && !metaKey && !shiftKey) {
                    if (!repeat) this.handleCancel();

                    event.preventDefault();
                    event.stopPropagation();
                }
                break;
            }
        }
    };

    handleSubmit = () => {
        const { chatId, editMessageId } = this.state;
        const element = this.newMessageRef.current;
        if (!element) return;

        let { innerHTML } = element;

        element.innerText = null;
        this.handleInput();

        if (!innerHTML) return;
        if (!innerHTML.trim()) return;

        innerHTML = innerHTML.replace(/<div><br><\/div>/gi, '<br>');
        innerHTML = innerHTML.replace(/<div>/gi, '<br>');
        innerHTML = innerHTML.replace(/<\/div>/gi, '');

        this.sendMessage(innerHTML, false, result => {});
    };

    render() {
        const {
            chatId,
        } = this.state;
        return (
            <div
                className='inputbox-background'>
                <div className='inputbox'>
                    <div className='inputbox-bubble'>
                        <div className='inputbox-wrapper'>
                            <div className='inputbox-left-column'>
                            </div>
                            <div className='inputbox-middle-column'>
                                <div
                                    id='inputbox-message'
                                    ref={this.newMessageRef}
                                    contentEditable
                                    suppressContentEditableWarning
                                    onKeyDown={this.handleKeyDown}
                                    onPaste={this.handlePaste}
                                    onInput={this.handleInput}>
                                </div>
                            </div>
                            <div className='inputbox-right-column'>
                                <input
                                    ref={this.attachDocumentRef}
                                    className='inputbox-attach-button'
                                    type='file'
                                    multiple='multiple'
                                    onChange={this.handleAttachDocumentComplete}
                                />
                                <input
                                    ref={this.attachPhotoRef}
                                    className='inputbox-attach-button'
                                    type='file'
                                    multiple='multiple'
                                    accept='image/*'
                                    onChange={this.handleAttachPhotoComplete}
                                />
                                <AttachButton
                                    chatId={chatId}
                                    onAttachPhoto={this.handleAttachPhoto}
                                    onAttachDocument={this.handleAttachDocument}
                                    onAttachPoll={this.handleAttachPoll}
                                />
                            </div>

                        </div>
                    </div>
                    <div className='inputbox-send-button-background'>
                        <IconButton
                            className='inputbox-send-button'
                            aria-label='Send'
                            size='small'
                            onClick={this.handleSubmit}>
                            {/*{editMessageId ? <DoneIcon /> : <SendIcon />}*/}
                            <SendIcon />
                        </IconButton>
                    </div>
                </div>
            </div>
        );
    }

    handleInput() {

    }

    handleAttachDocumentComplete() {

    }

    handleAttachPhotoComplete() {

    }

    handlePaste() {

    }

    sendMessage = async (inputContent, b, f) => {
        const msg = new msg_pb.Msg();
        console.log("IMController sendMsg", inputContent);
        msg.setConversationid(this.state.chatId);
        msg.setCid(AppStore.getCid());
        msg.setType(msg_pb.MsgType.TEXT);
        msg.setJetts(Date.now());
        msg.setBlob(new TextEncoder("utf-8").encode(inputContent));

        const chat = ChatStore.get(this.state.chatId);
        if (!chat) {
            console.error("sendMessage failed!")
            return;
        }

        IMController.sendMsg(msg, chat.conv);
    }
}

export default InputboxControl;