/* import express from "express"; */
import userRouter from "./auth.routes.js";
import adminRouter from "./admin.routes.js";
import docs from "./swagger.routes.js";
/* const app = express(); */

const apiRoutes = (app) => {
  app.use("/api/users", userRouter);
  app.use("/api/admin", adminRouter);
  app.use("/api/docs", docs);
};

export default apiRoutes;
