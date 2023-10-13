
import { Router } from "express"
import { validationCoreFunction } from "../../middleware/validation.js"
import { changePasswordSchema, signInSchema, signUpSchema, updateProfileSchema , confirmEmailSchema, forgetPasswordSchema } from "./auth.validationSchema.js"
import { errorHandler } from "../../utilities/errorHandling.js"
import * as authControllers from './auth.controller.js'
import { isAuth } from "../../middleware/auth.js"
import { allowedExtensions, multerCloudFunction } from "../../services/multerCloud.js"
import { userRoles } from "./auth.roles.js"

const router = Router()

router.post('/signUp',multerCloudFunction(allowedExtensions.Image).single('picture') ,validationCoreFunction(signUpSchema), errorHandler(authControllers.signUp))
router.get('/confirmedEmail/:token',validationCoreFunction(confirmEmailSchema), errorHandler(authControllers.confirmedEmail))
router.post('/signIn', validationCoreFunction(signInSchema), errorHandler(authControllers.signIn))

router.post('/forgetPassword',validationCoreFunction(forgetPasswordSchema),errorHandler(authControllers.forgetPassword))
router.post('/resetPassword',errorHandler(authControllers.resetPassword))


router.put('/changPassword', isAuth(userRoles.changPassword), validationCoreFunction(changePasswordSchema), errorHandler(authControllers.changPassword))
router.put('/updateProfile', isAuth(userRoles.updateProfile),multerCloudFunction(allowedExtensions.Image).single('picture') ,validationCoreFunction(updateProfileSchema), errorHandler(authControllers.updateProfile))

router.delete('/deleteOneUser', isAuth(userRoles.deleteOneUser), errorHandler(authControllers.deleteOneUser))
router.patch('/softDeleteUser', isAuth(userRoles.softDeleteUser), errorHandler(authControllers.softDeleteUser))

router.patch('/logOut', isAuth(userRoles.logOut), errorHandler(authControllers.logOut))

 //======================================== cloud multer =======================================

 router.post('/profilePicture20',multerCloudFunction(allowedExtensions.Image).single('profile'),isAuth(),errorHandler(authControllers.profilePicture20))  // if i need only one from images

 router.post('/updateProfilePicture20',multerCloudFunction(allowedExtensions.Image).single('profile'),isAuth(),errorHandler(authControllers.updateProfilePicture20))  // if i need only one from images

  router.post('/coverPictures21',multerCloudFunction(allowedExtensions.Image ).array('cover'),isAuth(),errorHandler(authControllers.coverPictures21))  // if i need to send more than one images

 //======================================== generate qr code =======================================

 router.get('/getUserProfile',isAuth(), errorHandler(authControllers.getUserProfile))

 


export default router