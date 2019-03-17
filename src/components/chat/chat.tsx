import React, { useState } from 'react'
import { Message, Users, SubMessage } from '../main/main'

import './chat-styles.scss'

interface Props {
    sendMessage: Function;
    user: Users;
    messages: SubMessage[];
    type: string;
}
const Chat = (props: Props) => {
    const { user, sendMessage } = props

    const [message, setMessage] = useState<string>("")
    console.log(props.messages)
    return (
        <div className="chat">
            <div className="actual-chat">
                {props.messages.length > 0 && props.messages.map((v, i) => {
                    return (
                        <div className="message" key={i}>
                            <span>{v.name + ": " + v.message}</span>
                        </div>
                    )
                })}
            </div>
            <div className="givemessage">
                <form
                    onSubmit={(e) => {
                        e.preventDefault()
                        const payload: Message = {
                            id: user.id,
                            name: user.name,
                            message,
                            type: "message"
                        }
                        setMessage("")
                        sendMessage(payload)
                    }}
                >
                    <input
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Send a message"
                    />
                </form>
            </div>
        </div>
    )
}

export default Chat