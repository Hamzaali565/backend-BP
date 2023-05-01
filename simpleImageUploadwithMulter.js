import multer from "multer";
import fs from "fs";

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
  const directory = "./uploads";
  try {
    if (!req.file) {
      res.status(200).send({ message: "post without image" });
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
      return;
    } else {
      res.status(200).send({ message: "post with image" });
      return;
    }
  } catch (err) {
    console.log("err", err);
  }
});
