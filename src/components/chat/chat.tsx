import React, { useState, useRef, useEffect } from 'react'
import { Users, SubChat, Message, ChatData } from '../main/main'

import './chat-styles.scss'

interface Props {
    sendMessage: Function;
    user: Users;
    chatData: ChatData;
    selected: string;
}
const Chat = (props: Props) => {
    const { user, selected } = props

    const [message, setMessage] = useState<string>("")
    const [fail, setFail] = useState<string | null>(null)
    const chatDiv: React.RefObject<HTMLInputElement> = useRef()
    const objData: SubChat = props.chatData[props.selected]
    useEffect(() => {
        if (chatDiv && chatDiv.current) {
            chatDiv.current.scrollTop = chatDiv.current.scrollHeight;
        }
    }, [props.chatData])
    return (
        <div className="chat">
        <h4>{objData.type === "home" ? "Global Chat" : `Private messaging ${objData.name}`}</h4>
            <div className="actual-chat" ref={chatDiv}>
                {objData.messages.length > 0 && objData.messages.map((v, i) => {
                    return (
                        <div className="message" key={i}>
                            <span className="name">{v.name  + ": "}</span>
                            <span>{v.message}</span>
                        </div>
                    )
                })}
            </div>
            <div className="givemessage">
                <form
                    onSubmit={(e) => {
                        e.preventDefault()
                        if (message.length === 0) throw "Message must be longer"

                        switch (selected) {
                            case "home":
                                const globalMessage = {
                                    id: user.id,
                                    name: user.name,
                                    message: {
                                        name: user.name,
                                        id: user.id,
                                        message: message,
                                        type: "home"
                                    }, 
                                    type: "home"
                                }
                                props.sendMessage(globalMessage)
                                break
                            default:
                                const privateMessage = {
                                    id: objData.id,
                                    message: {
                                        name: user.name,
                                        id: user.id,
                                        message: message
                                    },
                                    type: "private"
                                }
                                props.sendMessage(privateMessage)
                        }
                        setMessage("")
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