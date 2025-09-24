const multer = require("multer")

const hotelRoomPhotoUpload = multer({ storage: multer.diskStorage({}) }).array("photo", 5)
const hotelPhotoUpload = multer({ storage: multer.diskStorage({}) }).single("photo")
const vehiclePhotoUpload = multer({ storage: multer.diskStorage({}) }).array("photo", 5)

module.exports = { hotelRoomPhotoUpload, vehiclePhotoUpload, hotelPhotoUpload }