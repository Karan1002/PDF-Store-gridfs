const express = require("express");
const app = express();
const { default: mongoose } = require("mongoose");
const multer = require("multer");
const { GridFsStorage } = require("multer-gridfs-storage");

require("dotenv").config();

app.use(express.json());
app.use(
  express.urlencoded({
    extended: false,
  })
);

//bucket
let bucket;
mongoose.connection.on("connected", () => {
  let client = mongoose.connections[0].client;
  let db = mongoose.connections[0].db;
  bucket = new mongoose.mongo.GridFSBucket(db, { bucketName: "newBucket" });
  console.log(bucket);
});

const storage = new GridFsStorage({
  url: process.env.MONGO_URI,
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      const fileName = file.originalname;
      const fileInfo = {
        filename: file,
        bucketName: "newBucket",
      };
      resolve(fileInfo);
    });
  },
});

process.on("unhandledRejection", (error) => {
  console.log("unhandledRejection", error.message);
});
const upload = multer({
  storage,
});

app.post("/upload", upload.single("file"), (req, res) => {
  res.status(200).send("File uploaded successfully");
});

let port = 5000 || process.env.PORT;
app.listen(port, async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log(`Connected with DB and port is ${port}`);
  } catch (error) {
    console.log(error);
  }
});
