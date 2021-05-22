import swaggerJsDoc from "swagger-jsdoc";
import swaggerUi from"swagger-ui-express"; 
import { Router } from "express";
import { swaggerDefinition } from "../doc/swaggerDef.js";
import { APP_PATH } from "../config/config.app.js";

const router = Router();

const specs = await swaggerJsDoc({
    swaggerDefinition,
    apis: [
        APP_PATH + '/src/routes/*.js',                 
        APP_PATH + '/src/doc/*.yml', 
    ],    
    components:{
        securitySchemes: {
            jwt: {
                type: 'http',
                scheme: 'bearer',
                in: 'header',
                bearerFormat: 'JWT'    
            }
        },
        security: [{
            jwt: []
        }]
    }
  });

router.use('/', swaggerUi.serve);

router.get('/', swaggerUi.setup(specs, {
        explorer: true,
    })
);

export {
    router as docsRouter
}  