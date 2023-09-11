import "dotenv/config";
import "express-async-errors"
import express, {NextFunction} from 'express';
import {CustomError} from "./errors";
import cors from 'cors';
import morgan from "morgan";
import {loadRepository} from "./controllers";
import * as path from "path";

const app = express();
app.use(cors());
app.use(morgan("dev"));
app.get("/api/*", async function(req: express.Request<{0: string}>, res) {
  const output = await loadRepository(path.join("/", req.params[0]).replaceAll("\\", "/"));
  res.json({
    success: true,
    data: output,
  })
})
app.use("/static", express.static("./static"));

app.use("*", (e: unknown, req: express.Request, res: express.Response, next: NextFunction) => {
  console.error(e);
  if (e instanceof CustomError) {
    res.status(e.httpCode).json({
      success: false,
      error: e.message,
    });
  }
  else if (e instanceof Error) {
    res.status(500).json({
      success: false,
      error: e.message,
    })
  } else {
    res.status(500).json({
      success: false,
      error: "Unspecified error",
    })
  }
})
app.listen(process.env.PORT || 7000);
