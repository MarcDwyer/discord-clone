import React from 'react'
import { Users } from '../main/main'
import { ListView } from './list-styled'

import './list-styles.scss'

interface Props {
    users: Users[];
    user: Users;
}
const List = (props: Props) => {
    const { users, user } = props
    const newUser = users.filter(v => v.name.length > 0)
    return (
        <ListView>
            <div className="main-user">
                <h2>Online Users {users.length}</h2>
                {users && (
                    newUser.map((v, i) => {
                        return (
                            <div className="user" key={i}
                            onClick={() => {
                                if (v.id === props.user.id) return
                                console.log("not my name")
                            }}
                            >
                                <span>{v.name}</span>
                            </div>
                        )
                    })
                )}
            </div>
        </ListView>
    )
}

export default List