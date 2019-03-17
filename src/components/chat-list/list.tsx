import React from 'react'
import { Users } from '../main/main'
import { ListView } from './list-styled'

import './list-styles.scss'

interface Props {
    users: Users[];
    user: Users;
    openWindow: Function;
    tab: Users;
}
const List = (props: Props) => {
    const { users, user, tab } = props
    const newUser = users.filter(v => v.name.length > 0)
    return (
        <ListView>
            <div className="main-user">
            <div className="user home"
            style={tab.id === 'home' ? {backgroundColor: "rgba(127,191,127, .15)"} : {}}
            onClick={() => props.openWindow({id: "home", name: "home"})}
            >
                <span>Home</span>
            </div>
                <h2>Online Users {newUser.length}</h2>
                {users && (
                    newUser.map((v, i) => {
                        return (
                            <div className="user" key={i}
                            style={tab.id === v.id ? {backgroundColor: "#3A3A42"} : {}}
                                onClick={() => {
                                    if (v.id === props.user.id) return
                                    props.openWindow(v)
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