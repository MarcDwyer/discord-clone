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
    users: Users[] | null;
    selected: string;
    chatData: ChatData;
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
    messages: SubMessage[]; 
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
        users: null,
        selected: "home",
        chatData: {
            "home": {
                id: "home",
                name: "home",
                messages: []
            }
        }
    }
    componentDidMount() {
        const { ws, selected } = this.state
        ws.addEventListener("message", (msg) => {
            const payload = JSON.parse(msg.data)
            if (Array.isArray(payload)) {
                this.setState({ users: payload })
                return
            }
            switch (payload.type) {
                case "id":
                    this.setState({ id: payload.id })
                    return
                case "address":
                    this.setState({ user: payload })
                    return
                case "home":
                    this.setState((prevState) => {
                        const newObj = prevState.chatData
                        newObj["home"].messages.push(payload)
                        return { chatData: newObj }
                    })
                    return
                case "private":
                this.setState((prevState) => {
                    const newObj = prevState.chatData
                    if (!newObj[payload.to]) {
                        console.log("1")
                        newObj[payload.id] = payload
                        return
                    } else {
                        console.log("2")
                        newObj[payload.to].messages.push(payload.message)
                    }
                    
                    return { chatData: newObj }
                })
            }
            console.log(this.state.chatData)
        })
    }
    render() {
        const { user, users, ws, name, id, chatData, selected } = this.state
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
                {users && user && (
                    <div className="main-div">
                        <List users={users} user={user} addWindow={this.addWindow} chatData={chatData} selected={selected} setSelected={this.setSelected} />
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
    addWindow = (to: Users) => {
        this.setState((prevState) => {
            const newWin: SubChat = {
                id: to.id,
                messages: []
            }
            const newObj = prevState.chatData
            newObj[to.id] = newWin
           return { selected: to.id, chatData: newObj }
        })
    }
}

export default Main