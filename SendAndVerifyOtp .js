import { customAlphabet, nanoid } from "nanoid";
import moment from "moment";
import bcrypt from "bcrypt";

const OtpSchema = new mongoose.Schema({
  otp: { type: String, required: true },
  owner: { type: mongoose.ObjectId, ref: "NewUsers", required: true },
  isUsed: { type: Boolean, default: false },
  email: { type: String, required: true },
  createdOn: { type: Date, default: Date.now },
});
export const otpModel = mongoose.model("OTP", OtpSchema);

// Send OTP
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

// verify OTP
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
