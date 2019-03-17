import React, { Component } from 'react'
import { MainDiv, Container, EnterName, Header, Form } from './main-styles'
import List from '../chat-list/list'
import Chat from '../chat/chat'

import './main-styles.scss'

interface IState {
    ws: WebSocket | null;
    name: string;
    id: string | null;
    user: Users | null;
    users: Users[] | null;
    messages: SubMessage[];
    tabs: Users[];
}
export interface Users {
    id: string;
    name: string;
}
export interface Message {
    id: string;
    message: string;
    name: string;
    type: string;
}
export interface SubMessage {
    message: string;
    name: string;
    type: string;
}
class Main extends Component<{}, IState> {
    state = {
        ws: new WebSocket(`ws://${document.location.hostname}:5000/sockets/`),
        user: null,
        id: null,
        name: '',
        users: null,
        messages: [],
        tabs: [{id: "home", name: "home"}]
    }
    componentDidMount() {
        const { ws, messages } = this.state
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
                case "message":
                    this.setState((prevState) => {
                        return { messages: [...prevState.messages, payload] }
                    })
                    return
            }
        })
    }
    render() {
        const { user, users, ws, name, id, messages, tabs } = this.state
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
                        <List users={users} user={user} />
                        <div className="sub-div">
                            {tabs.map((v, i) => (
                                <Chat key={i} type={v} sendMessage={this.sendMessage} user={user} messages={messages} />
                            ))}
                        </div>
                    </div>
                )}
            </MainDiv>
        )
    }
    sendMessage = (msg: Message) => {
        const { ws } = this.state
        ws.send(JSON.stringify(msg))
    }
    openWindow = (name: Users) => {
        this.setState((prevState) => {
            return {tabs: [...prevState.tabs, name]}
        })
    }
}

export default Main