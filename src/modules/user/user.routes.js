
import { Router } from "express"
import { validationCoreFunction } from "../../middleware/validation.js"
import { changePasswordSchema, signInSchema, signUpSchema, updateProfileSchema } from "./user.validationSchema.js"
import { errorHandler } from "../../utilities/errorHandling.js"
import * as userControllers from './user.controller.js'
import { isAuth } from "../../middleware/auth.js"
import { allowedExtensions, multerCloudFunction } from "../../services/multerCloud.js"

const router = Router()

router.post('/signUp', validationCoreFunction(signUpSchema), errorHandler(userControllers.signUp))
router.get('/confirmedEmail/:token', errorHandler(userControllers.confirmedEmail))
router.post('/signIn', validationCoreFunction(signInSchema), errorHandler(userControllers.signIn))

router.put('/changPassword', isAuth(), validationCoreFunction(changePasswordSchema), errorHandler(userControllers.changPassword))
router.put('/updateProfile', isAuth(), validationCoreFunction(updateProfileSchema), errorHandler(userControllers.updateProfile))

router.delete('/deleteOneUser', isAuth(), errorHandler(userControllers.deleteOneUser))
router.patch('/softDeleteUser', isAuth(), errorHandler(userControllers.softDeleteUser))

router.patch('/logOut', isAuth(), errorHandler(userControllers.logOut))

 //======================================== cloud multer =======================================

 router.post('/profilePicture20',multerCloudFunction(allowedExtensions.Image).single('profile'),isAuth(),errorHandler(userControllers.profilePicture20))  // if i need only one from images

 router.post('/updateProfilePicture20',multerCloudFunction(allowedExtensions.Image).single('profile'),isAuth(),errorHandler(userControllers.updateProfilePicture20))  // if i need only one from images

  router.post('/coverPictures21',multerCloudFunction(allowedExtensions.Image ).array('cover'),isAuth(),errorHandler(userControllers.coverPictures21))  // if i need to send more than one images

 //======================================== generate qr code =======================================

 router.get('/getUserProfile',isAuth(), errorHandler(userControllers.getUserProfile))

 


export default router