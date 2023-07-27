const port=process.env.PORT;
const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "API documentation For FEEDBACK API",
    version: "0.0.1",
    description: "Please if you have a doubts, contact backend team",
    license: {
      name: "MIT",
      url: "https://github.com/No-Country/s9-10-node-react.git",
    },
  },
  securityDefinitions:{
    myCookie:{
      type: "apiKey",
      name: "Cookie",
      in:"header",
    },
  },
  servers: [
    {
      url: `http://localhost:${port}/api`,
      description: "Development Server",
    },
  ],
};

export default swaggerDefinition;
