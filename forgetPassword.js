import bcrypt from "bcrypt";

app.put("/api/v1/forgetpassword", async (req, res) => {
  try {
    let body = req.body;
    let response = await userModel.findOne({ email: body.email }).exec();
    console.log("response", response);
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
