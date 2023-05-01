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
    if (file.mimetype.includes("video")) {
      cb(null, true);
    } else {
      cb(new Error("File type not supported"), false);
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 },
}).single("video");

app.post("/api/v1/upload", async (req, res) => {
  const directory = "./uploads";
  try {
    upload(req, res, function (err) {
      if (err instanceof multer.MulterError) {
        console.log("File too large");
        return res.status(400).json({ message: "File too large" });
      }
      if (!req.file) {
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
        res.status(400).send({ message: "No data" });
        return;
      } else if (err) {
        return res.status(500).json({ message: "Server error" });
      }
      res.status(200).json({ message: "File uploaded successfully" });
    });
    //   return;
    // }
  } catch (err) {
    res.status(400).send({ message: `${err}` });
  }
});
