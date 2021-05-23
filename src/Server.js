import express from "express";
import cors from 'cors';
import helmet from "helmet";
import httpStatus from "http-status"; 

import logger from "./config/logger.js";
import responseObjectBuilder from "./helpers/functions.helper.js";
import { dbConnection } from './database/config.db.js';
import { userRouter } from './routes/user.routes.js';
import { authRouter } from './routes/auth.routes.js';
import { docsRouter } from "./routes/docs.routes.js";
import { PORT, env } from './config/config.app.js';

class Server{
    #app = null;
    #port= null;     
    userPath= '';
    authPath= '';
    docAPIPath= '';

    constructor() {
        this.userAPIPath= '/api/users';
        this.authAPIPath= '/api/auths';
        this.docAPIPath= '/api-docs';
                
        //config
        this.#app= express();
                
        this.#port = PORT;   
        
        this.#connectDB();                        

        this.#middlewares();    

        this.#routes();                   
    }    
    
    #routes(){
        //adding routes to server                
        this.#app.use(this.authAPIPath, authRouter);
        this.#app.use(this.userAPIPath, userRouter);  
        
        if (env === 'development') {        
            this.#app.use(this.docAPIPath, docsRouter);                       
        }                     
        
        this.#app.use((req, res, next) => {
            next(responseObjectBuilder(res, httpStatus.NOT_IMPLEMENTED, 'Fail', 'Not enabled', 'Resource you require is not implemented.'));
        });
    }

    #middlewares(){
        //middlewares
        //CORS: enable petition when using several services at same server
        this.#app.use(cors());

        // set security HTTP headers
        this.#app.use(helmet());        
        //TODO: add helmet CSP policy
        // this.#app.use(helmet({contentSecurityPolicy:false}));        
        // this.#app.use(helmet.contentSecurityPolicy({
        //     directives: {
        //      defaultSrc: ["'self'", "apis.google.com"],
        //      styleSrc: ["'self'","'unsafe-inline'", 'fonts.googleapis.com', 'use.fontawesome.com'],
        //      scriptSrc: ["'self'","'unsafe-inline'",'apis.google.com'],
        //      frameSrc: ["'self'",'apis.google.com'],
        //      fontSrc:["'self'",'fonts.googleapis.com'],
        //      frameAncestors:["'self'",'fonts.googleapis.com']
        //    }
        //   }));

          /*
          
          this.#app.use(helmet.contentSecurityPolicy({
            directives: {
             defaultSrc: ["'self'","'unsafe-inline'"],
             styleSrc: ["'self'","'unsafe-inline'", 'fonts.googleapis.com'],
             scriptSrc: ["'self'","https://apis.google.com"],             
             fontSrc:["'self'",'fonts.googleapis.com']
           }
          }));          
          */     

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

    #connectDB( ){
        try {
            dbConnection();   
        } catch (error) {
             logger.error(`Error loading db, details:${error}`);    
        }         
    }
   
    start(){
        this.#app.listen(this.#port, () => {
            logger.info(`Server is running at port: ${this.#port}`);
        });
    }
}

export {
    Server
}