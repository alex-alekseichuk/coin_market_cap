import swaggerJsdoc from 'swagger-jsdoc';
import path from "node:path";

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: '3.0.3',
        info: {
            title: 'CoinMarketCap API',
            version: '1.0.0',
            description: 'CoinMarketCap API documentation',
        },
        servers: [
            {
                url: 'http://localhost:3000',
                description: 'Development server',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                },
            },
            schemas: {
                Crypto: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'integer',
                        },
                        symbol: {
                            type: 'string',
                        },
                        name: {
                            type: 'string',
                        },
                    },
                    required: ['id', 'symbol', 'name'],
                },
                Error: {
                    type: 'object',
                    properties: {
                        code: {
                            type: 'integer',
                        },
                        message: {
                            type: 'string',
                        },
                    },
                    required: ['code', 'message'],
                },
            },
        },
    },
    apis: ['./app/routes/**/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
