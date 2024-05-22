import express, {Request, Response} from "express"
import {UnitUser, User} from "./user.interface"
import {StatusCodes} from "http-status-codes"
import * as database from "./user.repository"


//create an express router
export const userRouter = express.Router()

//route for "index" page. get a list of users (unitusers[]) req and res are express Request and Response methods
userRouter.get("/users", async (req: Request, res: Response) => {
    try {
        //all users will take the type of array of UnitUsers. wait for the repository to find them with the find all method
        const allUsers: UnitUser[] =- await database.findAll()

        //if they don't exist, throw error
        if (!allUsers){
            return res.status(StatusCodes.NOT_FOUND).json({msg: `No users at this time...}`})
        }

        //if they do exist, http statuscode ok, return an Ok status in form of json with the number of total users is the length of all users, and all users are listed?
        return res.status(StatusCodes.OK).json({total_user: allUsers.length, allUsers})

        //if unable to communicate with database, throw error
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({error})
    }
})

//route for "show" page
userRouter.get("/user/:id", async (req: Request, res: Response) => {
    try {
        //a user is a UnitUser found by a given id as a parameter for the request
        const user: UnitUser = await database.findOne(req.params.id)

        if (!user) {
            return res.status(StatusCodes.NOT_FOUND).json({error: `User not found!`})
        }

        return res.status(StatusCodes.OK).json({user})
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({error})
    }
})

//route for posting a new user. this is the route that utilizes the create method?
userRouter.post("/register", async (req: Request, res: Response) => {
    try {
        //send the required user keys in the req body
        const { username, email, password } = req.body
        
        //if anything is missing, throw error message requestinng all parameters
        if (!username || !email || !password) {
            return res.status(StatusCodes.BAD_REQUEST).json({error: `Please provide all the required parameters..`})
        }

        //check if user already exists in db by searching email
        const user = await database.findByEmail(email) 

        //if already exists, inform user
        if (user) {
            return res.status(StatusCodes.BAD_REQUEST).json({error: `This email has already been registered..`})
        }

        //if user doesn't already exist, create a new one by sending the req body to the create method
        const newUser = await database.create(req.body)

        //return a status that it is created with the new user as a json
        return res.status(StatusCodes.CREATED).json({newUser})

    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({error})
    }
})

//login route
userRouter.post("/login", async (req: Request, res: Response) => {
    
    try {
        const {email, password} = req.body

        if (!email || !password) {
            return res.status(StatusCodes.BAD_REQUEST).json({error: "Please provide all the required parameters.."})
        }

        const user = await database.findByEmail(email)

        if (!user) {
            return res.status(StatusCodes.NOT_FOUND).json({error: "No user exists with the email provided.."})
        }
        //send email and password provided to db to compare with listed password for that email (already verified email exists)
        const comparePassword = await database.comparePassword(email, password)

        if (!comparePassword) {
            return res.status(StatusCodes.BAD_REQUEST).json({error: `Incorrect Password!`})
        }

        return res.status(StatusCodes.OK).json({user})

    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({error})
    }
})

//route for updating user
userRouter.put('/user/:id', async (req: Request, res: Response) => {

    try {

        const {username, email, password} = req.body

        const getUser = await database.findOne(req.params.id)

        if (!username || !email || !password) {
            return res.status(401).json({error: `Please provide all the required parameters..`})
        }

        if (!getUser) {
            return res.status(404).json({error: `No user with id ${req.params.id}`})
        }

        //directing to right user via id, updated user w/ info in the req body
        const updateUser = await database.update((req.params.id), req.body)

        return res.status(201).json({updateUser})
    } catch (error) {
        console.log(error) 
        return res.status(500).json({error})
    }
})

//delete route
userRouter.delete("/user/:id", async (req: Request, res: Response) => {
    try {
        const id = (req.params.id)

        const user = await database.findOne(id)

        if (!user) {
            return res.status(StatusCodes.NOT_FOUND).json({error: `User does not exist`})
        }

        await database.remove(id)

        return res.status(StatusCodes.OK).json({msg : "User deleted"})
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({error})
    }
})