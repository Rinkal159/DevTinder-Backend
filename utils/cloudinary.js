const cloudinary = require("cloudinary").v2;
const fs = require("fs");

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadFileOnCloudinary = async (imageURL) => {
    try {
        if (!imageURL) {
            throw new Error(`URL not found`)
        }

        const imageUpload = await cloudinary.uploader.upload(imageURL, {
            overwrite: false,
            resource_type: "image",
            quality: "auto",
            fetch_format: "auto",
            timeout: 120000
        })
        
        // unlink meaning delete the picture from system
        fs.unlinkSync(imageURL)

        // hosted URL by clodinary
        return imageUpload.secure_url;

    } catch (err) {

        if (fs.existsSync(imageURL)) {
            fs.unlinkSync(imageURL);
        }

        return null;
    }
}

module.exports = uploadFileOnCloudinary;