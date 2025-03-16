import { Express } from "express";
import morgan from "morgan";
const setupLogging = (app: Express) => {
  app.use(morgan("combined"));
};
export default setupLogging;
