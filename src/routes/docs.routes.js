import swaggerJsDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Router } from 'express';

import { swaggerDefinition } from '../doc/swaggerDef.js';
import { APP_PATH, logger } from '../config/index.js';

const router = Router();

const docs = async () => {
  try {
    const jsDocContent = {
      swaggerDefinition,
      apis: [`${APP_PATH}/src/routes/*.js`, `${APP_PATH}/src/doc/*.yml`],
      components: {
        securitySchemes: {
          jwt: {
            type: 'http',
            scheme: 'bearer',
            in: 'header',
            bearerFormat: 'JWT',
          },
        },
        security: [
          {
            jwt: [],
          },
        ],
      },
    };

    const specs = await swaggerJsDoc(jsDocContent);
    router.use('/', swaggerUi.serve);
    router.get(
      '/',
      swaggerUi.setup(specs, {
        explorer: true,
      })
    );
  } catch (error) {
    logger.error('Error on config swagger');
  }
};

docs();

// eslint-disable-next-line import/prefer-default-export
export { router as docsRouter };
