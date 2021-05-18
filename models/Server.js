import express from "express";
import cors from 'cors';

import { userRouter } from '../routes/user.routes.js';
import { dbConnection } from '../database/config.db.js';
import { PORT } from '../config/config.js';

class Server{
    #app = null;
    #port= null;    
    userPath= '';

    constructor() {
        this.userAPIPath= '/api/user';
        
        //config
        this.#connectDB();

        this.#app= express();
                
        this.#port = PORT;        

        this.#middlewares();                   
    }

    #middlewares(){
        //middlewares
        //CORS: enable petition when using several services at same server
        this.#app.use(cors());

        //parsing body        
        this.#app.use(express.json());
        this.#app.use(express.urlencoded({
            extended: true
        }));

        //adding public folder
        this.#app.use(express.static('public', {
            extensions: ['html']
        }));  
        
        //adding routes to server
        this.#app.use(this.userAPIPath, userRouter);
    }
    
    #connectDB( ){
         dbConnection();
    }
   
    start(){
        this.#app.listen(this.#port, () => {
            console.log(`Server is running at port: ${this.#port}`);
          });
    }
}

export {
    Server
}