//ts interfaces for users
//

import exp from "constants"

export interface User {
    username: string,
    email: string,
    password: string
}

export interface UnitUser extends User {
    id: string
}
//why make an extended interface to include id? why not include in user interface? for abstraction?


//collection of user objects with dynamic keys. keys can be any string. what do we expect them to be? values are unituser objects. The values of the Users object are of type UnitUser, which means each user object in the collection should conform to the UnitUser interface.
export interface Users {
    [key: string]: UnitUser
}

