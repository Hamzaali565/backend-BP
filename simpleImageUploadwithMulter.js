import multer from "multer";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads/");
  },
  filename: (req, file, cb) => {
    console.log("mul-file: ", file);
    cb(null, `${file.fieldname}-${Date.now()}.jpg`);
  },
});
const upload = multer({ storage: storage });

// api
app.post("/api/v1/upload", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      res.status(200).send({ message: "post without image" });
      return;
    } else {
      res.status(200).send({ message: "post with image" });
      return;
    }
  } catch (err) {
    console.log("err", err);
  }
});
