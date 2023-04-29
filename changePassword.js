import bcrypt from "bcrypt";

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
