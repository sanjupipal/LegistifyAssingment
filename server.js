const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
const app = express();

//db
mongoose
  .connect(process.env.DATABASE_CLOUD, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("DB connected"))
  .catch((err) => console.log(err));

const routes = require("./routes/index");

app.use(express.json());

app.use("/api/v1/", routes);

const port = process.env.PORT;

app.listen(port, () => console.log(`API is running on port ${port}`));
