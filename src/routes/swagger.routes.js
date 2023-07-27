import express from "express";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import swaggerDefinition from "../controllers/swagger.definition.js";

const router = express.Router();

const specs = swaggerJsdoc({
  swaggerDefinition,
  apis: [ "packages/components.yaml","src/routes/*.js"],
});

router.use("/", swaggerUi.serve);
router.get(
  "/",
  swaggerUi.setup(specs, {
    explorer: true,
  })
);

export default router;
