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
});

// const directory = "./uploads";
app.post("/api/v1/upload", upload.single("file"), async (req, res, next) => {
  try {
    if (!req.file) {
      res.status(500).send({ message: `Please select an Image` });
      return;
    }
    console.log(req.file.mimetype);
    if (
      req.file.mimetype !== "image/jpeg" &&
      req.file.mimetype !== "image/png" &&
      req.file.mimetype !== "image/jpg"
    ) {
      console.log("Invalid file format");
      return res.status(400).json({ message: "Invalid file format" });
    }
    // size limit Validation
    // if (req.file.size > 1000) {
    //   return;
    // }
    const [file] = await bucket.upload(req.file.path, {
      destination: `image/${req.file.filename}`,
    });
    const [urlData] = await file.getSignedUrl({
      action: "read",
      expires: "03-09-2491",
    });
    console.log("public downloadable url: ", urlData);

    // Delete previously uploaded files
    const directory = "uploads";
    if (fs.existsSync(directory)) {
      const files = await fs.promises.readdir(directory);
      for (const file of files) {
        await fs.promises.unlink(`${directory}/${file}`);
      }
    }

    res.status(200).json({
      success: true,
      url: urlData,
    });
  } catch (error) {
    console.error(error);
    res.status(400).send({
      message: `${error}`,
    });
    // next(error);
  }
});
