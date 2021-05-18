import {Server} from './models/Server.js';


// if (process.env.NODE_ENV !== 'production'){
//     dotenv.config();
// };

const app = new Server();

app.start();
