import React from 'react'
import { Users, ChatData } from '../main/main'
import { ListView } from './list-styled'

import './list-styles.scss'

interface Props {
    users: Users[];
    user: Users;
    addWindow: Function;
    chatData: ChatData;
}
const List = (props: Props) => {
    const { users, user, chatData } = props
    const newUser = users.filter(v => v.name.length > 0)
    return (
        <ListView>
            <div className="main-user">
            <div className="user home"
            style={chatData["home"] ? {backgroundColor: "rgba(127,191,127, .15)"} : {}}
            >
                <span>Home</span>
            </div>
                <h2>Online Users {newUser.length}</h2>
                {users && (
                    newUser.map((v, i) => {
                        return (
                            <div className="user" key={i}
                            style={chatData[v.id] ? {backgroundColor: "#3A3A42"} : {}}
                                onClick={() => {
                                    if (v.id === props.user.id) return
                                    props.addWindow(v.id, v)
                                }}
                            >
                                <span>{v.name}</span>
                            </div>
                        )
                    })
                )}
            </div>
            <h3 className="welcome">Welcome {user.name}!</h3>
        </ListView>
    )
}

export default List