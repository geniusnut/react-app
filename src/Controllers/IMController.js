import {EventEmitter} from "events";
import {WS_URL} from "../Constants";
var im_pb = require('../gen/im_pb');
var conv_pb = require('../gen/conversation_pb');
var msg_pb = require('../gen/msg_pb');

class IMController extends EventEmitter {
    state = {
        cid: "83ed7501a1918f33ff24e6a4",
        messages: [],
    };
    ws = new WebSocket(WS_URL );

    constructor() {
        super();

        this.parameters = {};
        this.disablelog = true;
        this.localStorage = false;
    }

    init = () => {
        this.ws.binaryType = 'arraybuffer';
        this.ws.onopen = () => {
            console.log("onopen");
            this.login();
        };

        this.ws.onmessage = ev => {
            console.log(ev);
            const buffer = new Uint8Array(ev.data);  // arraybuffer object
            const imResponse = im_pb.IMResponse.deserializeBinary(buffer);
            console.log(imResponse);
            this.handleMessage(imResponse);
        };

        this.ws.onclose = () => {
            console.log('disconnected');
        };
        this.ws.onerror = ev => {
        }
    };

    handleMessage(response) {
        const {cid} = this.state;
        switch (response.getOperation()) {
            case im_pb.IMOperation.CLIENTOPEN: {
                this.ackResponse(im_pb.IMOperation.ACKCLIENTOPEN);
                this.queryConvs();
                break;
            }
            case im_pb.IMOperation.CONVERSATIONQUERY: {
                const convs = conv_pb.ConversationList.deserializeBinary(response.getBlob())
                this.emit('update', {
                    '@type': 'queryConv',
                    convs: convs.getConvsList(),
                });
                break;
            }
            case im_pb.IMOperation.TARGETMESSAGESEND: {
                const msg = msg_pb.Msg.deserializeBinary(response.getBlob())
                console.log('ackResponse', response.getTs())
                this.ackResponse(im_pb.IMOperation.ACK, response.getTs())
                this.emit('update', {
                    '@type': 'tgtMsgSend',
                    msg: msg,
                });
                break;
            }
            case im_pb.IMOperation.CONVERSATIONMESSAGESEND: {
                const msgAck = msg_pb.MsgAck.deserializeBinary(response.getBlob())
                console.log("CONVERSATIONMESSAGESEND, ", msgAck);
                this.emit("update", {
                    '@type': 'msgAck',
                    msgAck: msgAck,
                });

                break;
            }

            case im_pb.IMOperation.CONVERSATIONMESSAGEREAD: {
                const msgRead = msg_pb.MsgRead.deserializeBinary(response.getBlob())
                console.log("CONVERSATIONMESSAGEREAD, ", msgRead);
                this.emit("update", {
                    '@type': 'msgRead',
                    msgRead: msgRead,
                });

                break;
            }
        }
    }

    ackResponse = (op, ts = 0) => {
        const request = new im_pb.IMRequest();
        request.setCid(this.state.cid);
        request.setOperation(op);
        request.setTs(ts);
        this.send(request);
    };

    readMessage(convId, msg) {
        if (!msg) {
            console.log("readMessage error: ", convId)
            return
        }
        const msgRead = new msg_pb.MsgRead();
        msgRead.setCid(msg.getCid());
        msgRead.setId(msgId);
        msgRead.setConversationid(convId);
        const request = new im_pb.IMRequest();
        request.setCid(this.state.cid);
        request.setOperation(im_pb.IMOperation.CONVERSATIONMESSAGEREAD);
        request.setBlob(msgRead.serializeBinary());
        this.send(request);
    }

    login() {
        const request = new im_pb.IMRequest();
        request.setCid(this.state.cid);
        request.setOperation(im_pb.IMOperation.CLIENTOPEN);
        this.send(request);
    }

    queryConvs() {
        console.log('queryConvs');
        const request = new im_pb.IMRequest();
        request.setCid(this.state.cid);
        request.setOperation(im_pb.IMOperation.CONVERSATIONQUERY);
        request.setTs(Date.now());
        this.send(request);
    }

    clientUpdate = update => {
        if (!this.disableLog) {
            console.log('clientUpdate', update);
        }
        this.emit('clientUpdate', update);
    };

    send = request => {
        const b = request.serializeBinary();
        console.log(request, b);
        this.ws.send(b);
    };

    setChatId = (chatId, messageId = null) => {
        const update = {
            '@type': 'clientUpdateChatId',
            chatId: chatId,
            messageId: messageId
        };

        this.clientUpdate(update);
    };

    sendMsg(msg, conv) {
        const request = new im_pb.IMRequest();
        request.setConversation(conv);
        request.setCid(this.state.cid);
        request.setOperation(im_pb.IMOperation.CONVERSATIONMESSAGESEND);
        request.setTs(Date.now());
        request.setMsg(msg);
        this.send(request);

        const update = {
            '@type': 'clientSendMessage',
            msg: msg,
        }
        this.clientUpdate(update)
    }
}

const controller = new IMController();
window.im = controller;
export default controller;