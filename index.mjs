import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { customAlphabet, nanoid } from "nanoid";
import moment from "moment";
import multer from "multer";
import fs from "fs";
import { error } from "console";
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
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads/");
  },
  filename: (req, file, cb) => {
    console.log("mul-file: ", file);
    cb(
      null,
      `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    if (file.mimetype.includes("video")) {
      cb(null, true);
    } else {
      cb(new Error("File type not supported"), false);
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 },
}).single("video");

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

app.put("/api/v1/forgetpassword", async (req, res) => {
  try {
    let body = req.body;
    let response = await userModel.findOne({ email: body.email }).exec();
    console.log("response", response);
    if (!response) throw new Error("Invalid Email Input");
    const saltRound = 10;
    const salt = await bcrypt.genSalt(saltRound);
    let hashedPassword = await bcrypt.hash(body.password, salt);
    if (!hashedPassword) throw new Error("Error While Updating Password");
    let updatePassword = await userModel
      .findOneAndUpdate(
        { email: body.email },
        { password: hashedPassword },
        { new: true }
      )
      .exec();
    console.log("updatePassword", updatePassword);
    if (!updatePassword) throw new Error("Please try Later");
    res.status(200).send({ message: `Done` });
  } catch (error) {
    res.status(404).send({ message: `${error}` });
  }
});

app.post("/api/v1/upload", async (req, res) => {
  const directory = "./uploads";
  try {
    upload(req, res, function (err) {
      if (err instanceof multer.MulterError) {
        console.log("File too large");
        return res.status(400).json({ message: "File too large" });
      }
      if (!req.file) {
        if (fs.existsSync(directory)) {
          fs.readdir(directory, (err, files) => {
            if (err) throw err;
            for (const file of files) {
              fs.unlinkSync(`${directory}/${file}`, (err) => {
                if (err) throw err;
              });
            }
          });
        }
        res.status(400).send({ message: "No data" });
        return;
      } else if (err) {
        return res.status(500).json({ message: "Server error" });
      }
      res.status(200).json({ message: "File uploaded successfully" });
    });
    //   return;
    // }
  } catch (err) {
    res.status(400).send({ message: `${err}` });
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
