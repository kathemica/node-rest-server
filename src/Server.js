import express from "express";
import cors from 'cors';
import swaggerJsDoc from "swagger-jsdoc";
import swaggerUi from"swagger-ui-express"; 
import helmet from "helmet";

import logger from "./config/logger.js";
import responseObjectBuilder from "./helpers/functions.helper.js";
import { dbConnection } from './database/config.db.js';
import { userRouter } from './routes/user.routes.js';
import { authRouter } from './routes/auth.routes.js';
import { PORT, APP_PATH } from './config/config.app.js';

class Server{
    #app = null;
    #port= null; 
    #swaggerDocs = null;
    userPath= '';
    authPath= '';
    docAPIPath= '';

    constructor() {
        this.userAPIPath= '/api/user';
        this.authAPIPath= '/api/auth';
        this.docAPIPath= '/api-docs';
                
        //config
        this.#app= express();
                
        this.#port = PORT;   
        
        this.#connectDB();        
            
        this.#middlewares();    

        this.#swaggerDocConfig();
        this.#routes();                   
    }

    async #swaggerDocConfig(){
        // Extended: https://swagger.io/specification/#infoObject
        const swaggerOptions = {
            swaggerDefinition:{
                openapi: '3.0.0',
                info: {
                    title: 'node-rest-server API documentation',
                    version: '1.0.0',
                    license: {
                            name: 'Apache-2.0',
                            url: 'https://github.com/kathemica/node-rest-server/blob/V1.0.1/LICENSE',
                        },
                },
                servers: [
                    {
                        url: `http://localhost:8051`,
                    },
                ],
            },
            apis: [                
                APP_PATH + '/routes/*.js',                 
                APP_PATH + '/doc/*.yml', 
            ]
        }            
        this.#swaggerDocs = await swaggerJsDoc(swaggerOptions);      
        this.#app.use(this.docAPIPath, swaggerUi.serve, swaggerUi.setup(this.#swaggerDocs));   
    }

    #middlewares(){
        //middlewares
        //CORS: enable petition when using several services at same server
        this.#app.use(cors());

        // set security HTTP headers
        // this.#app.use(helmet());        
        this.#app.use(helmet({contentSecurityPolicy:false}));        
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

    #routes(){
        //adding routes to server                
        this.#app.use(this.authAPIPath, authRouter);
        this.#app.use(this.userAPIPath, userRouter);                       

        this.#app.use((req, res, next) => {
            next(responseObjectBuilder(res, 501, true, 'Not Implemented', 'Method not implemented', null));
        });
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