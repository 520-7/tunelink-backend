import express from "express";
import swaggerJsDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import feedRoutes from "./routes/feedRoutes.js";

const app = express();

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "TuneLink API",
      version: "1.0.0",
      description: "API Documentation for TuneLink",
    },
    servers: [
      {
        url: "http://localhost:3000",
      },
    ],
  },
  apis: ["./routes/*.js"],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.use(express.json());
app.use("/api", feedRoutes);

app.get("/health", (req, res) => {
  res.status(200).send("Server up and running.");
});

export default app;
