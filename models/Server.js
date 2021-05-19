import express from "express";
import cors from 'cors';

import { dbConnection } from '../database/config.db.js';
import { PORT } from '../config/config.js';

import { userRouter } from '../routes/user.routes.js';
import { authRouter } from '../routes/auth.routes.js';

class Server{
    #app = null;
    #port= null;    
    userPath= '';
    authPath= '';

    constructor() {
        this.userAPIPath= '/api/user';
        this.authAPIPath= '/api/auth';
        
        //config
        this.#connectDB();

        this.#app= express();
                
        this.#port = PORT;        

        this.#middlewares();    

        this.#routes();                   
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
    }

    #routes(){
        //adding routes to server
        this.#app.use(this.authAPIPath, authRouter);
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