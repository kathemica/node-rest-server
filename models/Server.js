import express from "express";
// import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import { userRouter } from '../routes/user.routes.js';
import { dbConnection } from '../database/config.db.js';

class Server{
    #app = null;
    #port= 8080;
    __filename = null;
    __dirname = null;
    userPath= '';

    constructor() {
        this.__filename = fileURLToPath(import.meta.url);
        this.__dirname = path.dirname(this.__filename);
        this.userAPIPath= '/api/user';
        
        //config
        this.#connectDB();

        this.#app= express();
                
        this.#port = process.env.PORT || 8080;        

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

    
    async #connectDB(){
        await dbConnection();
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