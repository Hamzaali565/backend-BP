import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { customAlphabet, nanoid } from "nanoid";
import moment from "moment";
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
    required: true,
  },
});
export const userModel = mongoose.model("NewUsers", userSchema);

const OtpSchema = new mongoose.Schema({
  otp: { type: String, required: true },
  owner: { type: mongoose.ObjectId, ref: "NewUsers", required: true },
  isUsed: { type: Boolean, default: false },
  email: { type: String, required: true },
  createdOn: { type: Date, default: Date.now },
});
export const otpModel = mongoose.model("OTP", OtpSchema);

app.post("/api/v1/signUp", async (req, res) => {
  //   try {
  let body = req.body;
  if (!body.email || !body.password || !body.name) {
    res.status(300).send({ message: "All Parameters Are Required" });
    return;
  }

  const saltRound = 10;
  const salt = await bcrypt.genSalt(saltRound);
  const hashedPassword = await bcrypt.hash(body.password, salt);
  const Data = {
    name: body.name,
    password: hashedPassword,
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
});

app.post("/api/v1/login", async (req, res) => {
  let body = req.body;
  try {
    let find = await userModel
      .findOne({ email: body.email }, "name email password _id")
      .exec();
    if (find) {
      console.log("ok find", find);
      const isMatched = await bcrypt.compare(body.password, find.password);
      if (!isMatched) throw new Error("Incorrect Passwaord");
      else {
        console.log("password Matched");
        const token = jwt.sign(
          {
            _id: find._id,
            email: find.email,
            iat: Math.floor(Date.now() / 1000) - 30,
          },
          SECRET
        );
        res.cookie("token", token, { httpOnly: true });
        res.status(200).send({
          message: "You Are LoggedInn",
          data: {
            userName: find.name,
            email: find.email,
            userId: find._id,
            token,
          },
        });
      }
    } else {
      console.log("ok not find");
      res.status(400).send({ message: "Invalid Email Address" });
      return;
    }
  } catch (error) {
    res.status(400).send({ message: `${error}` });
  }
});
const SECRET = process.env.SECRET || "topsecret";

app.put("/api/v1/updpass", async (req, res) => {
  let body = req.body;
  try {
    let checkPassword = await userModel
      .findOne({ email: body.email }, "email password")
      .exec();
    if (!checkPassword) throw new Error("Invalid Email Address");
    else {
      let isMatched = await bcrypt.compare(
        body.password,
        checkPassword.password
      );
      if (!isMatched) throw new Error("Incorrect Old Password");
      else {
        const saltRound = 10;
        const salt = await bcrypt.genSalt(saltRound);
        const hashedPassword = await bcrypt.hash(body.password1, salt);
        let updatePassword = await userModel.findOneAndUpdate(
          // email specify which field need tobe updates
          { email: body.email },
          //   Second argument updates it
          { password: hashedPassword },
          //   new returns updates document
          { new: true }
        );
        res.status(200).send({
          message: "Update",
          data: updatePassword,
        });
      }
    }
  } catch (error) {
    res.status(400).send({ message: `${error}` });
  }
});

app.post("/api/v1/sendotp", async (req, res) => {
  try {
    let body = req.body;
    let findEmail = await userModel
      .findOne({ email: body.email }, "email")
      .exec();
    console.log(findEmail);
    if (!findEmail) throw new Error("Incorrect Email");
    else {
      const nanoid = customAlphabet("1234567890", 4);
      const OTP = nanoid();
      console.log("OTP", OTP);
      const saltRound = 10;
      const salt = await bcrypt.genSalt(saltRound);
      const hashOTP = await bcrypt.hash(OTP, salt);
      let saveResponse = await otpModel.create({
        otp: hashOTP,
        email: body.email,
        owner: findEmail._id,
      });
      //   here you will send OTP through node mailer or by any other Linrary
      res.status(200).send({ data: OTP });

      // let hashOTP =
    }
  } catch (error) {
    res.status(200).send({ message: `${error}` });
  }
});

app.put("/api/v1/checkotp", async (req, res) => {
  try {
    let body = req.body;
    let response = await otpModel
      .findOne({ email: body.email })
      .sort({
        _id: -1,
      })
      .exec();
    if (!response) throw new Error("Invalid Email Address");
    const now = moment();
    const otpCreatedTime = moment(response.createdOn);
    const diffInMinutes = now.diff(otpCreatedTime, "minute");
    if (diffInMinutes > 5) throw new Error("Expired OTP");
    if (response.isUsed) throw new Error("Invalid OTP");
    else {
      console.log("response", response.otp);
      let checkotp = await bcrypt.compare(body.otp, response.otp);
      if (!checkotp) throw new Error("Invalid OTP");
      else {
        await response.updateOne({ isUsed: true }).exec();
        res.status(200).send({ message: "ok" });
      }
    }
  } catch (error) {
    res.status(400).send({ message: `${error}` });
  }
});
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
