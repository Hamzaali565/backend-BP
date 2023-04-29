import bcrypt from "bcrypt";

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
