import React from "react";
import {WS_URL} from "../Constants";
import ChatInput from "./ChatInput";
import ChatMessage from "./ChatMessage";
var im_pb = require('../gen/im_pb');
var msg_pb = require('../gen/msg_pb');


class Chat extends React.Component {
    state = {
        cid: "83ed7501a1918f33ff24e6a4",
        messages: [],
    };
    ws = new WebSocket(WS_URL);

    componentDidMount() {
        this.ws.binaryType = 'arraybuffer';
        this.ws.onopen = () => {
          console.log("onopen");
          this.login();
        };

        this.ws.onmessage = ev => {
            console.log(ev);
            var buffer = new Uint8Array(ev.data);  // arraybuffer object
            var imResponse = im_pb.IMResponse.deserializeBinary(buffer);
            console.log(imResponse);
            this.handleMessage(imResponse);
        };

        this.ws.onclose = () => {
            console.log('disconnected');
            this.setState({
                ws: new WebSocket(WS_URL),
            })
        };
        this.ws.onerror = ev => {

        }
    }

    login() {
        var request = new im_pb.IMRequest();
        request.setCid(this.state.cid);
        request.setOperation(im_pb.IMOperation.CLIENTOPEN);
        var b = request.serializeBinary();
        console.log(request, b);
        this.ws.send(b);
    }

    submitMessage = messageString => {
        const message = { name: this.state.name, message: messageString };
        this.ws.send(JSON.stringify(message));
        this.addMessage(message);
    };

    addMessage = message =>
        this.setState(state => ({ messages: [message, ...state.messages] }));

    render(){
        return (
            <div>
                <label htmlFor="name">
                    Name:&nbsp;
                    <input
                        type="text"
                        id={'name'}
                        placeholder={'Enter your name...'}
                        value={this.state.name}
                        onChange={e => this.setState({ name: e.target.value })}
                    />
                </label>
                <ChatInput
                    ws={this.ws}
                    onSubmitMessage={messageString => this.submitMessage(messageString)}
                />
                {this.state.messages.map((message, index) =>
                    <ChatMessage
                        key={index}
                        message={message.message}
                        name={message.name}
                    />,
                )}
            </div>
        )
    }

    handleMessage(response) {
        switch (response.getOperation()) {
            case im_pb.IMOperation.CLIENTOPEN: {

                break;
            }
            case im_pb.IMOperation.CONVERSATIONQUERY: {

            }
        }
    }
}

export default Chat
