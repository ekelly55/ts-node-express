import express, {Express, Request, Response} from 'express';
import dotenv from 'dotenv'
import cors from 'cors'
import helmet from 'helmet'
import { userRouter } from './users/users.routes';


dotenv.config()


const port = process.env.PORT || 3000;
const app: Express = express();

app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(cors())
app.use(helmet())

app.use('/', userRouter)

// this part is now handled by the router?
app.get('/', (req: Request, res: Response) => {
  res.send('this is a backup branch. server fixed');
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});