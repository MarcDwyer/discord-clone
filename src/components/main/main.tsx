import React, { Component } from 'react'
import { MainDiv, Container, EnterName, Header, Form } from './main-styles'
import List from '../chat-list/list'
import Chat from '../chat/chat'

import './main-styles.scss'

interface State {
    ws: WebSocket;
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
        const { ws, id, chatData } = this.state
        ws.addEventListener("message", (msg) => {
            const payload = JSON.parse(msg.data)
            if (Array.isArray(payload)) {
                const newUsers = payload.reduce((obj, item: Users) => {
                    const newObj = {
                        id: item.id,
                        name: item.name,
                        messages: [],
                        type: "private"  
                    }
                    obj[item.id] = newObj
                    return obj
                }, {})
                newUsers["home"] = {id: "home", name: "home", messages: [], type: "home"}
                console.log(newUsers)
                this.setState({ chatData: newUsers })
            }
            switch (payload.type) {
                case "id":
                    this.setState({ id: payload.id })
                    return
                case "address":
                    this.setState({ user: payload })
                    return
                case "home":
                console.log(payload)
                    this.setState((prevState) => {
                        const newObj = prevState.chatData
                        newObj["home"].messages = [...newObj["home"].messages, payload]
                        return { chatData: newObj }
                    })
                    return
                case "private":
                console.log(this.state.chatData)
                    if (this.state.chatData[payload.id]) {
                        this.setState((prevState) => {
                            const shallow: ChatData = prevState.chatData
                            shallow[payload.id].messages = [...shallow[payload.id].messages, payload.message]
                            return {chatData: shallow}
                        })
                    }
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
    setSelected = (select: string) => {
        this.setState({selected: select})
    }
    sendMessage = (msg) => {
        const { ws } = this.state
        ws.send(JSON.stringify(msg))
    }
}

export default Main