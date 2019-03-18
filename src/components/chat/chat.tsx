import React, { useState, useRef, useEffect } from 'react'
import { Message, Users, SubMessage, ChatData } from '../main/main'

import './chat-styles.scss'

interface Props {
    sendMessage: Function;
    user: Users;
    chatData: ChatData;
    selected: string;
}
const Chat = (props: Props) => {
    const { user, sendMessage, selected } = props

    const [message, setMessage] = useState<string>("")
    const [fail, setFail] = useState<string | null>(null)
    const chatDiv: React.RefObject<HTMLInputElement> = useRef()

    useEffect(() => {
        if (chatDiv && chatDiv.current) {
            chatDiv.current.scrollTop = chatDiv.current.scrollHeight;
        }
    }, [props.chatData])
    console.log(props.chatData[selected])
    return (
        <div className="chat">
            <div className="actual-chat" ref={chatDiv}>
                {props.chatData[selected].messages.length > 0 && props.chatData[selected].messages.map((v, i) => {
                    return (
                        <div className="message" key={i}>
                            <span className="name">{v.name+": "}</span>
                            <span>{v.message}</span>
                        </div>
                    )
                })}
            </div>
            <div className="givemessage">
                <form
                    onSubmit={(e) => {
                        e.preventDefault()
                        try {
                            if (message.length === 0) throw "Message must be longer"

                            const payload: Message = {
                                id: user.id,
                                name: user.name,
                                message,
                                type: "message"
                            }
                            setMessage("")
                            sendMessage(payload)
                        } catch(err) {
                            setFail(err)
                        }
                    }}
                >
                    <input
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder={fail || "Send a message"}
                    />
                </form>
            </div>
        </div>
    )
}

export default Chat