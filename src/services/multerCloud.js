import multer from "multer";   // to upload files
import { AppError } from "../utilities/AppError.js";


// i will make object to contain all extensions ...

export const allowedExtensions = {
    Image: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/tiff', 'image/psd', 'image/pdf', 'image/eps', 'image/ai', 'image/indd', 'image/raw'],
    Video: ['video/mp4', 'video/mov', 'video/avi', 'video/wmv', 'video/avchd', 'video/webm', 'video/flv'],
    File: ['application/pdf', 'application/javascript'],
    Audio: ['audio/mpeg', 'audio/wav', '']
}



export const multerCloudFunction = (allowedExtensionsArray) => {


    // ================================ storage ===========================================

    const storage = multer.diskStorage({})

    // ================================ fileFilter ===========================================

    if (!allowedExtensionsArray) {
        allowedExtensionsArray = allowedExtensions.Image   // if i forget to send allowedExtensionsArray so i should put default value
    }

    const fileFilter = function (req, file, cb) {

        if (allowedExtensionsArray.includes(file.mimetype)) {
            return cb(null, true)
        }

        cb(new AppError("invalid extension", 400), false)
    }


    // ================================ === ===========================================

    const fileUpload = multer({
        fileFilter, storage
    })
    return fileUpload
}


