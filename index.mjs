import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import mongoose from "mongoose";
import { error, log } from "console";
mongoose.set("strictQuery", false);

const app = express();
const port = process.env.PORT || 3001;

app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

// -- Schema -- //
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  password: { type: String, required: true },
  email: {
    type: String,
    match: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    unique: true,
  },
});
export const userModel = mongoose.model("NewUsers", userSchema);

app.post("/api/v1/signUp", async (req, res) => {
  //   try {
  let body = req.body;
  if (!body.email && !body.password && !body.name) {
    res.status(300).send({ message: "error" });
    return;
  }
  const Data = {
    name: body.name,
    password: body.password,
    email: body.email,
  };
  try {
    let result = await userModel.create(Data);
    console.log("data saved", result);
    res.status(200).send({ message: result });
  } catch (err) {
    if (err.code === 11000) {
      console.log("email Already exist");
      res.status(400).send({ message: `Email Already Exist` });
      return;
    }
    if ((err.errors.path = "email")) {
      console.log("Kindly try An Valid Email");
      res.status(400).send({ message: "Kindly try An Valid Email" });
      return;
    } else {
      console.log(err);
    }
  }

  //   } catch (err) {
  //     console.log("err", err);
  //     res.send({ message: `${err}` });
  //   }
});

const SECRET = process.env.SECRET || "topsecret";

// --- inCase of Static Hosting ---//
const __dirname = path.resolve();
app.use("/", express.static(path.join(__dirname, "./Frontend/build")));
app.use("*", express.static(path.join(__dirname, "./Frontend/build")));

// -------- //
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

// --- mongoose things ---- //
const mongodbURI =
  process.env.mongodbURI ||
  "mongodb+srv://CRUD:hamzaali565@cluster0.kh990zg.mongodb.net/discountStore?retryWrites=true&w=majority";

/////////////////////////////////////////////////////////////////////////////////////////////////
mongoose.connect(mongodbURI);

////////////////mongodb connected disconnected events///////////////////////////////////////////////
mongoose.connection.on("connected", function () {
  //connected
  console.log("Database is connected");
});

mongoose.connection.on("disconnected", function () {
  //disconnected
  console.log("Mongoose is disconnected");
  process.exit(1);
});

mongoose.connection.on("error", function (err) {
  //any error
  console.log("Mongoose connection error: ", err);
  process.exit(1);
});

process.on("SIGINT", function () {
  /////this function will run jst before app is closing
  console.log("app is terminating");
  mongoose.connection.close(function () {
    console.log("Mongoose default connection closed");
    process.exit(0);
  });
});
////////////////mongodb connected disconnected events///////////////////////////////////////////////

console.log("hello g");
