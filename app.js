const express = require("express");
const morgan = require("morgan");

const tourRouter = require("./routes/tourRoutes");
const userRouter = require("./routes/userRoutes");

const app = express();

// 1) Middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
app.use(express.json()); // express.json is the middleware, it's just the function that can modify the incoming request data
app.use(express.static(`${__dirname}/public`)); // Use this to serve static files

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// 3) Routes

app.use("/api/v1/tours", tourRouter); // Use tourRouter middleware to that URL,
app.use("/api/v1/users", userRouter); // Use userRouter middleware to that URL

module.exports = app;
