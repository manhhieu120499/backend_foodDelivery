const cloudinary = require("cloudinary").v2;
require("dotenv").config();
const logger = require("pino")();

cloudinary.config({
  secure: true,
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET_KEY,
});

const uploadImage = async (imageUrl) => {
  try {
    const resultUpload = await cloudinary.uploader.upload(imageUrl, {
      folder: "food_delivery",
    });
    return resultUpload.secure_url;
  } catch (err) {
    logger.error(`Upload image failed: ${err}`);
    return null;
  }
};

module.exports = { uploadImage };
