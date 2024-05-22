import {User, UnitUser, Users} from "./user.interface"
import bcrypt from "bcryptjs"
//uuid is a unique identifier. this imports a version 4 uuid with the alias random
import {v4 as random} from "uuid"
//fs is the built-in node file system
import fs from "fs"

//the variable users is of type Users and is the output of the function loadUsers
let users: Users = loadUsers()

//function loadusers is of type Users? does that mean that's what it returns?

function loadUsers (): Users {
    //async function
    try{
        //data is what's returned by the file system function readfilesync when it accesseses the users.json
        const data = fs.readFileSync('./users.json', 'utf-8')
        //return the data, parsed from the json object
        return JSON.parse(data)
    } catch (error){
        console.log(`Error ${error}`)
        return {}
    }
}
//why no type? type should be Users, right? or no, b/c it doesnt return anything?
function saveUsers(){
    try{
        //file system function writes users as a string
        fs.writeFileSync(".users.json", JSON.stringify(users), "utf-8")
        console.log(`User saved successfully)`)
    }catch (error){
        console.log(`Error: ${error}`)
    }
}

//findall is an async function of type Promise - it will return all users as an object of unitusers 
export const findAll = async (): Promise<UnitUser[]> => Object.values(users);

//findone is the same. it takes a parameter of an id and is a promise, returning a unituser, which is also the user id
export const findOne = async (id: string): Promise<UnitUser> => users[id];

//creaate takes a parameter of userdata of type unituser. returns a new unituser or null
export const create = async (userData: UnitUser): Promise<UnitUser | null> => {
    //random function chooses a uuid
    let id = random()
    //check user makes sure the id isn't already in the db
    let check_user = await findOne(id);

    //while (if) check user exists (i.e. the id is found in the db already), pick id again and check again
    while(check_user){
        id = random()
        check_user = await findOne(id)
    }
    //once we have a usable id, generate a salt value for encryption
    //a salt is an extra bit of data used in encryption
    const salt = await bcrypt.genSalt(10);

    //hashing a password uses the password and the generated salt value
    const hashedPassword = await bcrypt.hash(userData.password, salt);

    //the new user is created using this schema, filling in the appropriate values generated above
    //user is of type UnitUser (b/c it contains keys of User + id)
    const user: UnitUser = {
        id: id,
        username: userData.username,
        email: userData.email,
        password: hashedPassword
    };

    //new user is added into users
    users[id] = user;

    //call function save users to write new user to db
    saveUsers()

    //new user is returned
    return user;
};

//function to find a user by email: returns a unituser
export const findByEmail = async (user_email: string): Promise<null | UnitUser> => {

    const allUsers = await findAll()

    //after finding all users, then in the set of users, find the user with the email given as a parameter
    const getUser = allUsers.find(result => user_email === result.email);
    
    //if it doesn't find a user with that email, returns nothing
    if(!getUser){
        return null;
    }

    //otherwise returns the user
    return getUser;
};

export const comparePassword = async (email: string, supplied_password: string): Promise<null | UnitUser> =>{
    const user = await findByEmail(email)
    //user! uses the non-null assertion operator. It tells the TypeScript compiler that you are certain user is not null or undefined at that point in the code, even if TypeScript's type-checking logic cannot guarantee this. is this because before this can run, the findbyEmail function had to finish running so we have an existing user? But what if findbyemail returns null? 
    const decryptPassword = await bcrypt.compare(supplied_password, user!.password)

    if(!decryptPassword){
        return null
    }

    return user
}

export const update = async (id: string, updateValues: User): Promise<UnitUser | null> =>{

    //userExists returns a UnitUser
    const userExists = await findOne(id)

    if(!userExists){
        return null
    }

    if(updateValues.password){
        const salt = await bcrypt.genSalt(10)
        const newPass = await bcrypt.hash(updateValues.password, salt)

        updateValues.password = newPass
    }

    //the spread operator here merges objects: the existing one, userExists and the updateValues, which is of type User (note, that it's user b/c can't update the id, which is the only unique key to the unituser). updateValues properties overwrite userExists properties b/c it's spread after userExists. this method creates a new object without modifying either userExists or updateValues
    users[id] = {
        ...userExists,
        ...updateValues
    }

    saveUsers()

    return users[id]
}

export const remove = async (id: string): Promise<null | void> => {
    const user = await findOne(id)

    if(!user){
        return null
    }

    //delete is a built in js operator used to remove a property from an object. in this case, the property of an individual user from the all users object.
    delete users[id]

    saveUsers()
}