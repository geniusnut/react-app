import {EventEmitter} from "events";
import {CLIENT_PROFILE_URL, CLIENT_UPLOAD_URL, WS_URL} from "../Constants";
import axios from 'axios';
var im_pb = require('../gen/im_pb');
var conv_pb = require('../gen/conversation_pb');
var msg_pb = require('../gen/msg_pb');

class IMController extends EventEmitter {
    state = {
        cid: null,
        messages: [],
    };
    ws;

    constructor() {
        super();

        this.userSet = new Set();
        this.downloadSet = new Set();
        this.parameters = {};
        this.disablelog = true;
        this.localStorage = false;
    }

    init = (cid) => {
        console.log("IMController init")
        this.ws = new WebSocket(WS_URL);
        this.state.cid = cid;
        this.ws.binaryType = 'arraybuffer';
        this.ws.onopen = () => {
            console.log("onopen");
            this.emit('update', {
                '@type': 'imState',
            })
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
            console.log('disconnected', Date.now());
            this.emit('update', {
                '@type': 'imState',
            })
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
                // console.log("CONVERSATIONMESSAGESEND, ", msgAck);
                this.emit("update", {
                    '@type': 'msgAck',
                    msgAck: msgAck,
                });

                break;
            }

            case im_pb.IMOperation.CONVERSATIONMESSAGEREAD: {
                const msgRead = msg_pb.MsgRead.deserializeBinary(response.getBlob())
                // console.log("CONVERSATIONMESSAGEREAD, ", msgRead);
                this.emit("update", {
                    '@type': 'msgRead',
                    msgRead: msgRead,
                });

                break;
            }
            case im_pb.IMOperation.TARGETMESSAGEREAD: {
                const msgRead = msg_pb.MsgRead.deserializeBinary(response.getBlob())
                // console.log("TARGETMESSAGEREAD, ", msgRead);
                this.emit("update", {
                    '@type': 'msgHasRead',
                    msgRead: msgRead,
                });

                break
            }
            case im_pb.IMOperation.CONVERSATIONGROUPINFO: {
                const conv = msg_pb.Conversation.deserializeBinary(response.getBlob())
                console.log("CONVERSATIONGROUPINFO, ", conv);
                this.emit("update", {
                    '@type': 'groupInfo',
                    conv: conv,
                });

                break;
            }
            case im_pb.IMOperation.CONVERSATIONMESSAGEUPDATE: {
                const update = im_pb.MessageUpdate.deserializeBinary(response.getBlob())
                this.emit("update", {
                    '@type': 'messageUpdate',
                    convId: update.getConvid(),
                    msgId: update.getMsgid(),
                });
                break;
            }
            case im_pb.IMOperation.CONVERSATIONMESSAGEPULL: {
                const msgs = msg_pb.MsgList.deserializeBinary(response.getBlob())
                if (msgs.getMsgsList().length === 0) return;
                this.emit("update", {
                    '@type': 'messagePull',
                    msgs: msgs.getMsgsList(),
                    chat_id: msgs.getConvid(),
                    finshed: msgs.getFinished(),
                });
                break;
            }
        }
    }

    pullMessage = (convId, msgId) => {
        const msgPull = new im_pb.MessagePull();
        msgPull.setDirect(true);
        msgPull.setMsgid(msgId);
        msgPull.setConvid(convId);
        msgPull.setLimit(10);
        const request = new im_pb.IMRequest();
        request.setCid(this.state.cid);
        request.setOperation(im_pb.IMOperation.CONVERSATIONMESSAGEPULL);
        request.setBlob(msgPull.serializeBinary());
        this.send(request);
    };

    getImState() {
        return this.ws ? false : this.ws.readyState === this.ws.OPEN;
    }

    ackResponse = (op, ts = 0) => {
        const request = new im_pb.IMRequest();
        request.setCid(this.state.cid);
        request.setOperation(op);
        request.setTs(ts);
        this.send(request);
    };

    readMessage(convId, msg) {
        if (!msg || msg.getCid() === this.state.cid) {
            return
        }
        const msgRead = new msg_pb.MsgRead();
        msgRead.setCid(msg.getCid());
        msgRead.setId(msg.getId());
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

    update = update => {
        if (!this.disableLog) {
            console.log('update', update);
        }
        this.emit('update', update);
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

    sendFile(msg, content, name, conv) {
        this.uploadImage(content, name,msg, url => {
            const fileBean = msg_pb.FileBean.deserializeBinary(msg.getBlob());
            fileBean.setUrl(url);
            msg.setBlob(fileBean.serializeBinary())

            const request = new im_pb.IMRequest();
            request.setConversation(conv);
            request.setCid(this.state.cid);
            request.setOperation(im_pb.IMOperation.CONVERSATIONMESSAGESEND);
            request.setTs(Date.now());
            request.setMsg(msg);
            this.send(request);
        });
        const update = {
            '@type': 'clientSendMessage',
            msg: msg,
        };
        this.clientUpdate(update)
    }

    sendImage(msg, content, name, conv) {
        this.uploadImage(content, name, msg, url => {
            const image = new msg_pb.Image();
            image.setImgurl(url);
            msg.setBlob(image.serializeBinary())

            const request = new im_pb.IMRequest();
            request.setConversation(conv);
            request.setCid(this.state.cid);
            request.setOperation(im_pb.IMOperation.CONVERSATIONMESSAGESEND);
            request.setTs(Date.now());
            request.setMsg(msg);
            this.send(request);
        })
        const update = {
            '@type': 'clientSendMessage',
            msg: msg,
        }
        this.clientUpdate(update)
    }

    logout() {
        this.ws.close();
        this.clientUpdate({
            '@type': "clientLogout",
        })
    }

    queryGroup(convId) {
        const request = new im_pb.IMRequest();
        const conv = new conv_pb.Conversation();
        conv.setId(convId);
        conv.setVersion(0);
        request.setConversation(conv);
        request.setOperation(im_pb.IMOperation.CONVERSATIONGROUPINFO);
        this.send(request);
    }

    async getUser(uid, token, openId, cid) {
        if (this.userSet.has(cid)) {
            return
        }
        this.userSet.add(cid)
        const headers = {
            'uid': uid,
            'token': token,
            'openId': openId,

        }
        console.log("IMController: ", new Error().stack);
        axios.post(CLIENT_PROFILE_URL, 'cid='+cid, {
            headers: headers
        }).then(data => {
            console.log(data);
            if (data.data.code === 200) {
                this.update({
                    '@type': 'updateUser',
                    'user': data.data.data,
                })
            } else {
                this.userSet.delete(cid);
            }
        }).catch(e => {
            console.log(e);
            this.userSet.delete(cid);
        })
    }

    async downloadFile(url) {
        if (this.downloadSet.has(url)) {
            return
        }
        this.downloadSet.add(url)
        axios.get(url)
            .then(response => {
                console.log('IMController downloadFile', response.data)
                this.update({
                    '@type': 'downloadFile',
                    url: url,
                    file: response.data,
                })
                //Buffer.from(response.data, 'binary').toString('base64')
            }).catch(e => {
                console.log('IMController downloadFile',e)
        })
    }

    uploadImage = (content, name, msg, callback) => {
        const convId = msg.getConversationid();
        const msgId = msg.getJetts();

        const formData = new FormData()
        formData.append("name", name)
        formData.append("file", content)
        const headers = {
            // 'uid': uid,
            // 'token': token,
            // 'openId': openId,
            // 'Content-Type': "multipart/form-data",
        };
        axios.post(CLIENT_UPLOAD_URL, formData, {
            headers: headers,
            onUploadProgress: progressEvent => {
                const totalLength = progressEvent.lengthComputable ? progressEvent.total : progressEvent.target.getResponseHeader('content-length')
                    || progressEvent.target.getResponseHeader('x-decompressed-content-length');
                console.log("onUploadProgress", totalLength, progressEvent);
                let progressData = 0;
                if (totalLength !== null) {
                    progressData = Math.round( (progressEvent.loaded * 100) / totalLength );
                }
                this.clientUpdate({
                    '@type': 'clientUpdateProgress',
                    chat_id: convId,
                    message_id: msgId,
                    progress: progressData,
                });
            },
        }).then(response => {
            console.log("uploadImage", {response: response})
            callback(response.data.data)
        }).catch(e => {
            console.log("uploadImage", e)
        })
    }
}

const controller = new IMController();
window.im = controller;
export default controller;