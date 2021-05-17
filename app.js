import dotenv from 'dotenv';
import {Server} from './models/Server.js';

dotenv.config();
console.log(process.env);

const app = new Server();

app.start();
