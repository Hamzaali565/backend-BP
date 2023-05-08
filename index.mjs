import express, { response } from "express";
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
import admin from "firebase-admin";
import { error } from "console";
mongoose.set("strictQuery", false);

const app = express();
const port = process.env.PORT || 3001;

app.use(express.json());
app.use(cookieParser());

var serviceAccount = {
  type: "service_account",
  project_id: "usingstoragebucket",
  private_key_id: "1f0aa9632d1046aa9791fb872cb1d41f00626c9a",
  private_key:
    "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQChNLzeRk3jtTtr\nkAqImmqaQN+72594fDClmR4ekauM3DtJ5F9HQZJUW+HbpZ9SDqtq17xSdjvYzQaG\nZEr5uuBy5yWeQ6qX77q5l7JijMWbJYmqYs1BsbJIq9qQJXhlQG7ho9G7/wiQXUWH\nnmimsW+l6wuVxgauzmzsq0rRlOl7+QPqNj4ydtEXiWCgch7E4XrHnQB2FU4qB5YR\nfSRkS8wfn+SFgLB9LEcJhncL4BCQP47v0vjV4lSL39Gn14bJgHwlshO24WpFKFfR\nBJQ+1Sr3BZ5Zms+P+IsgfU1JGQVBI/8ZeSAIXfw++dVbVRFJSbFA98GFoNP6+eEf\nrdMYQDW1AgMBAAECggEAHXovAgcBhZ6VYbcKUg3IafHsZ2XCvI2a+KDtysGwyJZZ\nygp2KKmzF/VgMKGRpzfS/Pu7bim8Ckn9RDRRKGaVVbVyIcU2S8eUkYzNW+tpU9QS\nnwMnjLhxRQwVsG+FmyAj1mM1/gYluv4vMVwUP0zpQUHgUbAO90Z8UO+GhBnScu5c\npIWgMf136qqSMoEg598vvsAh76otpg0xdpx3/M4XAHx1BhQWp3icIjREx6ypaSxj\nzXQRZOP8PH4C7uvfC0FgFhMOhrUV5dbqyIJ3zR+bmHWIFEs/lQZe0Dg+3OUpuss1\nRHqdtBzYdzeAsnVvcuT/+rKj7wgBdjnWRmIxGRpl6QKBgQDZQQK6jG0udQCkwxg8\nXCd2pgI260SX/wdZ3NYtFRAOu0GcXJjdrGIePanzu+C7z2wT+Puy5tporwusihow\nUsxZwQ83qQEwV59clyNra/I2XZvqTqEHjs6lPTl8ABitoIRmraHDe4BQaVDo2bAA\nfmzuAT8XoDjaVksCQBpLkX5ViQKBgQC99MqLz9RT6CCVxi1BVm7nZ9zFdKkAzYSI\nBka0oc1cG1DJOtTZTZfSgehF8J8Y/DIyHe5oC3d47GbeMIbLmHlI4jYPN22t+YB8\nuyR99K2hbeEV4WMW1K7gThB0njWiFMg0KKjQiYATfl/UUeA9tHL4AmzUhVYFNL0L\nYHzQ/YE/zQKBgD0xzq71NxvK4S+HtJ/r5UHKaP1HL78QmuV5CusP78H2hPiiLHzk\nPY7/F4wL87VzK6JEk8FEvWiXRdaH3/CUofL2Km8nL6qKQ900xUlQ0pz1qSFKnJkg\nZJyuri57aHgfqquxZMtHUlFUGPI9vxGkitJPj5H8E4eMnvw3SjDW/prhAoGAbvbs\nyzehBVL4lgWqshxXtP5LTV2UzE9COGPSMfrDCCc8zhB7/mUBZ4tTsGebyPCqMfSi\nLE1mgVE31lvqokxzrUvX4JO0kojJshNwgdPJCiAx+KItTEz5yzZPDpDNK92QBkgq\nNYfdNYYBXPpnUCR1dMOV55/sXCYuuNKolz0/n5ECgYBuKgSxAgT4xCxVTjB4d+a8\ngz/TTmOSKRrGyfDkpXqAz/kB9ihdwzkkU2e2FkUG1+vP8GwkbABuIDRbUcwrgm8R\nFCjU3LgKW6OBFGL1F0jFdL2E3HyFWcmezR1upn9ucBNkZ9M9YUt8CwccQZ/jKL0O\ngYDMAi5TjTEB0W71pXFHbA==\n-----END PRIVATE KEY-----\n",
  client_email:
    "firebase-adminsdk-uq87i@usingstoragebucket.iam.gserviceaccount.com",
  client_id: "112198917033342141451",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url:
    "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-uq87i%40usingstoragebucket.iam.gserviceaccount.com",
};
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://usingstoragebucket.firebaseio.com",
});

const bucket = admin.storage().bucket("gs://usingstoragebucket.appspot.com");

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
});

app.post("/api/v1/upload", upload.single("video"), async (req, res) => {
  try {
    if (!req.file) {
      res.status(500).send({ message: `Please select an video` });
      return;
    }
    console.log(req.file.mimetype);
    if (req.file.mimetype !== "video/mp4") {
      console.log("Invalid file format");
      return res.status(400).json({ message: "Invalid file format" });
    }
    // size limit Validation
    // if (req.file.size > 1000) {
    //   return;
    // }
    const [file] = await bucket.upload(req.file.path, {
      destination: `image/${req.file.filename}`,
    });
    const [urlData] = await file.getSignedUrl({
      action: "read",
      expires: "03-09-2491",
    });
    console.log("public downloadable url: ", urlData);

    // Delete previously uploaded files
    const directory = "uploads";
    if (fs.existsSync(directory)) {
      const files = await fs.promises.readdir(directory);
      for (const file of files) {
        await fs.promises.unlink(`${directory}/${file}`);
      }
    }

    res.status(200).json({
      success: true,
      url: urlData,
    });
  } catch (error) {
    console.error(error);
    res.status(400).send({
      message: `${error}`,
    });
    // next(error);
  }
});

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
