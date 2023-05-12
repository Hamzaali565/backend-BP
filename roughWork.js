import multer from "multer";
import path from "path";

const [file] = await bucket.upload(req.file.path, {
  destination: `image/${req.file.filename}`,
});
const [urlData] = await file.getSignedUrl({
  action: "read",
  expires: "03-09-3000",
});
console.log(urlData);

const [file1] = await bucket.upload(req.file.path, {
  destination: `image/post/${req.file.filename}`,
});
const [urlData1] = await file.getSignedUrl({
  action: "read",
  expires: "09-09-3000",
});

const RF = async (hunt) => {
  const [file2] = await bucket.upload(req.file.path, {
    destination: `image/${hunt}/${req.file.fieldname}`,
  });
  const [urlData2] = await file.getSignedUrl({
    action: "read",
    expires: "09-09-3000",
  });
  console.log(urlData2);
  return urlData2;
};
let url = funter(place);
console.log(url);
const [file3] = await bucket.upload(rep.file.path, {
  destination: `image/${req.file.fieldname}`,
});
const [urlData3] = await file.getSignedUrl({
  action: "read",
  expires: "09-09-8000",
});
console.log(urlData3);

const [filed] = await bucket.upload(req.file.path, {
  destination: `image/${req.file.filename}`,
});
const [urlDatad] = await file.getSignedUrl({
  action: "read",
  expires: "09-09-3000",
});
console.log("urlData", urlDatad);

const [files] = await bucket.upload(req.file.path, {
  destination: `image/${req.file.fieldname}`,
});
const [urlDatas] = await file.getSignedUrl({
  action: "read",
  expires: "09-09-3003",
});
console.log(urlDatas);
const stira = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./upload");
  },
  filename: (req, file, cb) => {
    console.log("mul-file: ", file);
    cb(
      null,
      `${file.filename}-${Date.now()}-${path.extname(file.originalname)}`
    );
  },
});

const storages = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./upload");
  },
  filename: (req, file, cb) => {
    cb(
      null,
      `${file.filename}-${Date.now()}-${path.extname(file.originalname)}`
    );
  },
});
const steria = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./upload");
  },
  filename: (req, file, cb) => {
    cb(
      null,
      `${file.filename}-${Date.now()}-${path.extname(file.originalname)}`
    );
  },
});
