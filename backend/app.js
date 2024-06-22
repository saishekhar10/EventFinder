const config = require("./utils/config");
const express = require("express");
require("express-async-errors");
const app = express();
const cors = require("cors");
const userRouter = require("./controllers/users");
const loginRouter = require("./controllers/login");
const eventRouter = require("./controllers/events");
const middleware = require("./utils/middleware");
const logger = require("./utils/logger");
const mongoose = require("mongoose").set("strictQuery", true);

mongoose.set("strictQuery", false);

logger.info("connecting to", config.MONGODB_URI);

mongoose.connect(config.MONGODB_URI)
    .then(() => {
        logger.info("connected to MongoDB");
    })
    .catch((error) => {
        logger.error("error connecting to MongoDB:", error.message);
    });

app.use(cors());
app.use(express.json());
app.use(middleware.requestLogger);
app.use(express.static("dist"));

app.use("/api/login",loginRouter);
app.use("/api/users",userRouter);
app.use("/api/events",eventRouter);


app.use(middleware.errorHandler);
module.exports = app;