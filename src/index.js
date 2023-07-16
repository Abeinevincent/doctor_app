// Initialise the app as an express app
const express = require("express");
const app = express();

// Import all dependencies and dev-dependencies
const mongoose = require("mongoose");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
const dotenv = require("dotenv").config();
const multer = require("multer");
const multerS3 = require("multer-s3");
const { S3Client } = require("@aws-sdk/client-s3");
const awsS3Client = require("aws-sdk/clients/s3");

// Import all routes
const DoctorRoute = require("./routes/doctor");
const PatientRoute = require("./routes/patient");

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("MongoDB connected to the backend successfully");
  })
  .catch((err) => console.log(err));

// Middlewares
app.use(cors());

app.use(express.json());
app.use(helmet());
app.use(morgan("common"));

// Upload image to s3 bucket
const awsS3ClientConfiguration = {
  region: process.env.S3_REGION,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY,
    secretAccessKey: process.env.S3_ACCESS_SECRET,
  },
  sslEnabled: false,
  s3ForcePathStyle: true,
  signatureVersion: "v4",
};

const s3 = new S3Client(awsS3ClientConfiguration);

const upload = multer({
  storage: multerS3({
    s3,
    bucket: process.env.S3_BUCKET_NAME,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    metadata: function (req, file, cb) {
      cb(null, { fieldName: "TESTING_METADATA" });
    },
    key: function (req, file, cb) {
      cb(null, Date.now().toString());
    },
  }),
});

// instatiate a new s3 client to use for getting bucket objects
const awsBucket = new awsS3Client(awsS3ClientConfiguration);

app.get("/api", async (req, res) => {
  return res.status(200).json("Welcome to the fromyfarm api V.1");
});

app.post("/api/upload", upload.single("file"), async (req, res) => {
  if (!req.file) {
    console.log("No file uploaded");
  } else {
    try {
      return res
        .status(200)
        .json({ message: "File uploaded successfully", file: req.file });
    } catch (error) {
      return console.error(error);
    }
  }
});

// Retrieve image from the s3 bucket
async function getImage(bucket, key) {
  const params = {
    Bucket: bucket,
    Key: key,
  };

  const data = await awsBucket.getObject(params).promise();
  return data.Body;
}

app.use("/image/:key", async (req, res) => {
  const image = await getImage(process.env.S3_BUCKET_NAME, req.params.key);
  res.status(200).json(image);
});

app.use("/api/doctor", DoctorRoute);
app.use("/api/patient", PatientRoute);

// Start the backend server
const PORT = process.env.PORT || 8800;
app.listen(PORT, () => {
  console.log(`Backend server is listening at port ${PORT}`);
});
