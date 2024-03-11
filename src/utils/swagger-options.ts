import swaggerJsdoc, { Options } from 'swagger-jsdoc';

const options: Options = {
    definition: {
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
        openapi: '3.1.0',
        info: {
            title: 'JKT48 Private Message API',
            version: '1.6.9',
            description: 'API JKT 48 Private Message',
            license: {
                name: 'MIT',
                url: 'https://spdx.org/licenses/MIT.html',
            },
            contact: {
                name: 'Novian Andika',
                url: 'https://fleetime.my.id',
                email: 'hello@fleetime.my.ids',
            },
        },
        servers: [
            {
                url: 'http://localhost:6969',
            },
            {
                url: 'https://api.fleetime.my.id',
            },
        ],
    },
    apis: ['./**/*.ts'], // glob pattern to find API spec
};

export const specs = swaggerJsdoc(options);
