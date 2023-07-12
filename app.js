import express from "express";
import createError from "http-errors";
import logger from "morgan";
import cors from "cors";

import indexRouter from "./routes/index.js";
import usersRouter from "./routes/users.js";

import disciplineRouter from "./routes/discipline.js";
import countryRouter from "./routes/country.js";
import athleteRouter from "./routes/athlete.js";
import meetingRouter from "./routes/meeting.js";
import raceRouter from "./routes/race.js";
import pressureRouter from "./routes/pressure.js";
import positionRouter from "./routes/position.js";
import performanceRouter from "./routes/performance.js";
import recordRouter from "./routes/record.js";

import * as config from "./config.js";

import mongoose from "mongoose";
mongoose.Promise = Promise;
mongoose.connect(config.databaseUrl);

const app = express();

app.use(logger("dev"));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/", indexRouter);
app.use("/users", usersRouter);

app.use("/disciplines", disciplineRouter);
app.use("/countries", countryRouter);
app.use("/athletes", athleteRouter);
app.use("/meetings", meetingRouter);
app.use("/races", raceRouter);
app.use("/pressures", pressureRouter);
app.use("/positions", positionRouter);
app.use("/performances", performanceRouter);
app.use("/records", recordRouter);

// Serve the apiDoc documentation.
app.use('/apidoc', express.static('docs'));

// Catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// Error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // Send the error status
  res.status(err.status || 500);
  res.send(err.message);
});

export default app;
