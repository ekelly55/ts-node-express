import express, {Express, Request, Response} from 'express';
import dotenv from 'dotenv'
import cors from 'cors'
import helmet from 'helmet'


dotenv.config()

const app: Express = express();
const port = process.env.PORT || 3000;

app.get('/', (req: Request, res: Response) => {
  res.send('fixed nodemon/--respawn incompatibility');
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});