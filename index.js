import express from "express";
import cloudinary from "cloudinary";
import multer from "multer";
import dotenv from "dotenv";
dotenv.config();
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const {
	NODE_ENV,
	PORT,
	cloudinaryName,
	cloudinaryApiKey,
	cloudinaryApiSecret,
} = process.env;

app.listen(PORT, () => {
	console.log("server is up on port 4000");
});

const storage = multer.diskStorage({
	filename: function (req, file, cb) {
		cb(null, file.fieldname + "-" + Date.now());
	},
});

cloudinary.v2.config({
	cloud_name: cloudinaryName,
	api_key: cloudinaryApiKey,
	api_secret: cloudinaryApiSecret,
});

const upload = multer({ storage });

app.get("/", (req, res) => {
	return res.status(200).json({
		message: "Multiple uploader api",
	});
});

// ...
// if (NODE_ENV === "production") {
// ...
// }

app.post("/images", upload.array("pictures", 10), async (req, res) => {
	try {
		let pictureFiles = req.files;
		//Check if files exist
		if (!pictureFiles)
			return res.status(400).json({ message: "No picture attached!" });
		//map through images and create a promise array using cloudinary upload function
		let multiplePicturePromise = pictureFiles.map((picture) =>
			cloudinary.v2.uploader.upload(picture.path)
		);
		// await all the cloudinary upload functions in promise.all, exactly where the magic happens
		let imageResponses = await Promise.all(multiplePicturePromise);
		res.status(200).json({ images: imageResponses });
	} catch (err) {
		res.status(500).json({
			message: err.message,
		});
	}
});
