const notification = new mongoose.Schema({
  stinf: { type: String },
  owner: { type: mongoose.ObjectId, ref: "NewUsers", required: true },
  //   owner: { type: String, required: true },
});
export const notificationModel = mongoose.model("notification", notification);

app.post(`/api/v1/notify`, async (req, res) => {
  let body = req.body;
  let getUsers = await userModel.find({ name: body.name }, "_id").exec();
  console.log(getUsers);
  let create;
  let update = getUsers.map(async (id) => {
    create = await notificationModel.create({
      stinf: "hellos",
      owner: id._id,
    });
    // id?._id;
  });
  //   console.log("create", create);
});
