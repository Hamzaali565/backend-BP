import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

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
