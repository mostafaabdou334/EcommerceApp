import cloudinary from "./cloudinary.config.js"


export const errorHandler = (API) => {

    return (req, res, next) => {
        API(req, res, next).catch(async(err) => {

            // console.log(req.imagePath)
            // here if there is any error made me to enter in catch so i need to delete picture folder of product
            if (req.imagePath) {
                await cloudinary.api.delete_resources_by_prefix(req.imagePath)  // to delete all photos inside every folder in this path and give it the path of this folders
                await cloudinary.api.delete_folder(req.imagePath)  // now i can delete this folder after deleting every photos inside it

            }
            
            next(err)  // by this way i sent err to globalErrorHandler to union response
        })
    }
}