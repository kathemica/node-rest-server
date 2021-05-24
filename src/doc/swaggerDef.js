import { VERSION, PORT } from '../config/index.js';

const swaggerDef = {
  openapi: '3.0.0',
  info: {
    title: 'node-rest-server API documentation',
    version: VERSION,
    license: {
      name: 'Apache-2.0',
      url: 'https://github.com/kathemica/node-rest-server/blob/V1.0.1/LICENSE',
    },
  },
  servers: [
    {
      url: `http://localhost:${PORT}`,
    },
  ],
};

// eslint-disable-next-line import/prefer-default-export
export { swaggerDef as swaggerDefinition };
