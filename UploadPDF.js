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
    if (file.mimetype !== "application/pdf") {
      //   return cb(new Error("Only PDF files are allowed"));
      console.log("errror");
    }
    cb(null, true);
  },
  limits: { fileSize: 5 * 1024 * 1024 },
}).single("pdfFile");

app.post("/api/v1/upload", upload, async (req, res) => {
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
