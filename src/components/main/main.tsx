import React, { Component } from 'react'
import { MainDiv, Container, EnterName, Header, Form } from './main-styles'
import List from '../chat-list/list'


interface State {
    ws: WebSocket | null;
    isAuth: boolean;
    sendName: boolean;
    name: string;
    id: string | null;
    users: Users[] | null;
}
interface Users {
    id: string;
    name: string;
}
class Main extends Component<{}, State> {
    state = {
        ws: new WebSocket(`ws://${document.location.hostname}:5000/sockets/`),
        isAuth: false,
        sendName: false,
        id: null,
        name: '',
        users: null
    }
    componentDidMount() {
        const { ws } = this.state
            ws.addEventListener("message", (msg) => {
                const payload = JSON.parse(msg.data)
                if (Array.isArray(payload)) this.setState({users: payload})
                switch (payload.type) {
                    case "id":
                    this.setState({id: payload.id})
                }
            })
    }
    render() {
        const { isAuth, ws, name, id } = this.state
        console.log(this.state)
        return (
            <MainDiv>
                {!isAuth && (
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
                            this.setState({isAuth: true})
                        }}
                        >
                        <EnterName 
                        onChange={(e) => this.setState({name: e.target.value})}
                        value={name}
                        />
                        </Form>
                    </Container>
                )}
                {isAuth && (
                    <List />
                )}
            </MainDiv>
        )
    }
    changeAuth = () => {
        this.setState({isAuth: !this.state.isAuth})
    }
}

export default Main