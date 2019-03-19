import React from 'react'
import { Users, ChatData } from '../main/main'
import { ListView } from './list-styled'

import './list-styles.scss'

interface Props {
    user: Users;
    sendMessage: Function;
    chatData: ChatData;
    selected: string;
    setSelected: Function;
}
const List = (props: Props) => {
    const { user, chatData, selected } = props
    return (
        <ListView>
            <div className="main-user">
                <div className="user home"
                    style={selected === 'home' ? { backgroundColor: "rgba(127,191,127, .15)" } : {}}
                    onClick={() => props.setSelected("home")}
                >
                    <span>Home</span>
                </div>
                <h2>Online Users {Object.values(chatData).length}</h2>
                {Object.values(chatData).map((v, i) => {
                    if (v.name === "home") return
                    return (
                        <div className="user" key={i}
                            // @ts-ignore
                            style={v.id === selected ? { backgroundColor: "#3A3A42" } : {}}
                            onClick={() => {
                                if (v.id === props.user.id) return
                                props.setSelected(v.id)
                            }}
                        >
                            <span>{v.name}</span>
                        </div>
                    )
                })}
            </div>
            <h3 className="welcome">Welcome {user.name}!</h3>
        </ListView>
    )
}

export default List