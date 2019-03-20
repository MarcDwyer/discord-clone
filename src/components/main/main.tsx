import React, { Component } from 'react'
import { MainDiv, Container, EnterName, Header, Form } from './main-styles'
import List from '../chat-list/list'
import Chat from '../chat/chat'

import './main-styles.scss'

interface State {
    ws: WebSocket | null;
    name: string;
    id: string | null;
    user: Users | null;
    selected: string;
    chatData: ChatData | null;
}
export interface Users {
    id: string;
    name: string;
}
export interface ChatData {
    [key: string]: SubChat;
}
export interface SubChat {
    id: string;
    name: string;
    messages: SubMessage[];
    newMessage: boolean;
    isOnline: boolean;
    type: string; 
}
export interface Message {
    fromId: string;
    message: string;
    toId: string | undefined;
    fromName: string;
    type: string;
}
export interface SubMessage {
    message: string;
    id: string;
    name: string;
}
class Main extends Component<{}, State> {
    state = {
        ws: new WebSocket(`ws://${document.location.hostname}:5000/sockets/`),
        user: null,
        id: null,
        name: '',
        selected: "home",
        chatData: null
    }
    componentDidMount() {
        const { ws } = this.state
        ws.addEventListener("message", (msg) => {
            const payload = JSON.parse(msg.data)    
            switch (payload.type) {
                case "id":
                    this.setState({ id: payload.id })
                    break
                case "address":
                    this.setState({ user: payload })
                    break
                case "home":
                    this.setState((prevState) => {
                        const newObj = prevState.chatData
                        newObj["home"].messages = [...newObj["home"].messages, payload]
                        return { chatData: newObj }
                    })
                    break
                case "addUser":
                if (!this.state.chatData || payload.id === this.state.id) return

                    const shallow = this.state.chatData
                    const newObj = {...payload, messages: [], isOnline: true, type: "private"}
                    shallow[payload.id] = newObj
                    this.setState({chatData: shallow})
                break
                case "private":
                    if (this.state.chatData[payload.id]) {
                        const shallow = {...this.state.chatData}
                        shallow[payload.id].messages = [...shallow[payload.id].messages, payload.message]
                        if (shallow[payload.id].id !== this.state.selected) {
                            shallow[payload.id].newMessage = true
                        }
                            this.setState({chatData: shallow}) 
                    }
                    break
                case "offline":
                if (this.state.chatData && this.state.chatData[payload.id]) {
                    const shallow = {...this.state.chatData}
                    shallow[payload.id].isOnline = false
                    this.setState({chatData: shallow})
                }
                break
                default:
                payload["home"] = {id: "home", name: "home", isOnline: true, messages: [], type: "home"}
                this.setState({chatData: payload})
            }
        })
    }
    render() {
        const { user, ws, name, id, chatData, selected } = this.state
        return (
            <MainDiv>
                {!user && (
                    <Container>
                        <Header>
                            Enter a name
                        </Header>
                        <Form
                            onSubmit={(e) => {
                                e.preventDefault()
                                const obj = {
                                    id,
                                    name,
                                    type: "name"
                                }
                                ws.send(JSON.stringify(obj))
                            }}
                        >
                            <EnterName
                                onChange={(e) => this.setState({ name: e.target.value })}
                                value={name}
                            />
                        </Form>
                    </Container>
                )}
                {user && chatData && (
                    <div className="main-div">
                        <List user={user} sendMessage={this.sendMessage} chatData={chatData} selected={selected} setSelected={this.setSelected} />
                        <div className="sub-div">
                            <Chat chatData={chatData} sendMessage={this.sendMessage} user={user} selected={selected} />
                        </div>
                    </div>
                )}
            </MainDiv>
        )
    }
    setSelected = (select: SubChat) => {
        console.log(select.newMessage)
        if (select.newMessage) {
            const shallow = {...this.state.chatData}
            shallow[select.id].newMessage = false
            this.setState({chatData: shallow})
        }
        this.setState({selected: select.id})
    }
    sendMessage = (msg) => {
        const { ws } = this.state
        ws.send(JSON.stringify(msg))
    }
}

export default Main