const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// Swagger definition
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Trần Quốc Khang - BE ASSIGNMENT',
    version: '1.0.0',
    description: 'BE Assignment: Tài liệu API của hệ thống trang web thương mại điện tử',
  },
  servers: [
    {
      url: 'http://localhost:8080',
      description: 'Development server',
    },
    // {
    //   url: 'https://be-lab-socialapp.onrender.com/',
    //   description: 'Production server',
    // },
  ],
};

// Options for the swagger docs
const options = {
  swaggerDefinition,
  apis: ['../routes/**/*.js', '../models/*.js'], // Path to the API docs
};

// Initialize swagger-jsdoc
const swaggerSpec = swaggerJSDoc(options);

module.exports = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};