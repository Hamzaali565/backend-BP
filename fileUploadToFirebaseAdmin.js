import fs from "fs";
import admin from "firebase-admin";

let serviceAccount = {
  type: "service_account",
  project_id: "usingstoragebucket",
  private_key_id: "1f0aa9632d1046aa9791fb872cb1d41f00626c9a",
  private_key:
    "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQChNLzeRk3jtTtr\nkAqImmqaQN+72594fDClmR4ekauM3DtJ5F9HQZJUW+HbpZ9SDqtq17xSdjvYzQaG\nZEr5uuBy5yWeQ6qX77q5l7JijMWbJYmqYs1BsbJIq9qQJXhlQG7ho9G7/wiQXUWH\nnmimsW+l6wuVxgauzmzsq0rRlOl7+QPqNj4ydtEXiWCgch7E4XrHnQB2FU4qB5YR\nfSRkS8wfn+SFgLB9LEcJhncL4BCQP47v0vjV4lSL39Gn14bJgHwlshO24WpFKFfR\nBJQ+1Sr3BZ5Zms+P+IsgfU1JGQVBI/8ZeSAIXfw++dVbVRFJSbFA98GFoNP6+eEf\nrdMYQDW1AgMBAAECggEAHXovAgcBhZ6VYbcKUg3IafHsZ2XCvI2a+KDtysGwyJZZ\nygp2KKmzF/VgMKGRpzfS/Pu7bim8Ckn9RDRRKGaVVbVyIcU2S8eUkYzNW+tpU9QS\nnwMnjLhxRQwVsG+FmyAj1mM1/gYluv4vMVwUP0zpQUHgUbAO90Z8UO+GhBnScu5c\npIWgMf136qqSMoEg598vvsAh76otpg0xdpx3/M4XAHx1BhQWp3icIjREx6ypaSxj\nzXQRZOP8PH4C7uvfC0FgFhMOhrUV5dbqyIJ3zR+bmHWIFEs/lQZe0Dg+3OUpuss1\nRHqdtBzYdzeAsnVvcuT/+rKj7wgBdjnWRmIxGRpl6QKBgQDZQQK6jG0udQCkwxg8\nXCd2pgI260SX/wdZ3NYtFRAOu0GcXJjdrGIePanzu+C7z2wT+Puy5tporwusihow\nUsxZwQ83qQEwV59clyNra/I2XZvqTqEHjs6lPTl8ABitoIRmraHDe4BQaVDo2bAA\nfmzuAT8XoDjaVksCQBpLkX5ViQKBgQC99MqLz9RT6CCVxi1BVm7nZ9zFdKkAzYSI\nBka0oc1cG1DJOtTZTZfSgehF8J8Y/DIyHe5oC3d47GbeMIbLmHlI4jYPN22t+YB8\nuyR99K2hbeEV4WMW1K7gThB0njWiFMg0KKjQiYATfl/UUeA9tHL4AmzUhVYFNL0L\nYHzQ/YE/zQKBgD0xzq71NxvK4S+HtJ/r5UHKaP1HL78QmuV5CusP78H2hPiiLHzk\nPY7/F4wL87VzK6JEk8FEvWiXRdaH3/CUofL2Km8nL6qKQ900xUlQ0pz1qSFKnJkg\nZJyuri57aHgfqquxZMtHUlFUGPI9vxGkitJPj5H8E4eMnvw3SjDW/prhAoGAbvbs\nyzehBVL4lgWqshxXtP5LTV2UzE9COGPSMfrDCCc8zhB7/mUBZ4tTsGebyPCqMfSi\nLE1mgVE31lvqokxzrUvX4JO0kojJshNwgdPJCiAx+KItTEz5yzZPDpDNK92QBkgq\nNYfdNYYBXPpnUCR1dMOV55/sXCYuuNKolz0/n5ECgYBuKgSxAgT4xCxVTjB4d+a8\ngz/TTmOSKRrGyfDkpXqAz/kB9ihdwzkkU2e2FkUG1+vP8GwkbABuIDRbUcwrgm8R\nFCjU3LgKW6OBFGL1F0jFdL2E3HyFWcmezR1upn9ucBNkZ9M9YUt8CwccQZ/jKL0O\ngYDMAi5TjTEB0W71pXFHbA==\n-----END PRIVATE KEY-----\n",
  client_email:
    "firebase-adminsdk-uq87i@usingstoragebucket.iam.gserviceaccount.com",
  client_id: "112198917033342141451",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url:
    "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-uq87i%40usingstoragebucket.iam.gserviceaccount.com",
};
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://usingstoragebucket.firebaseio.com",
});

const bucket = admin.storage().bucket("gs://usingstoragebucket.appspot.com");

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

const upload = multer({ storage: storage });

app.post("/api/v1/upload", upload.single("file"), async (req, res, next) => {
  try {
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
    next(error);
  }
});
