
import { Router } from "express";
import { validationCoreFunction } from "../../middleware/validation.js";
import { errorHandler } from "../../utilities/errorHandling.js";
import * as cartController from './cart.controller.js'
import { addToCartSchema, deleteCartSchema, deleteProductSchema } from "./cart.validationSchema.js";
import { isAuth } from "../../middleware/auth.js";
import { cartRoles } from "./cart.roles.js";


const router = Router()

router.post('/addToCart',isAuth(cartRoles.addToCart),validationCoreFunction(addToCartSchema),errorHandler(cartController.addToCart))  
router.get('/userCart',isAuth(cartRoles.addToCart),errorHandler(cartController.userCart))  
router.patch('/updateToCart',isAuth(cartRoles.updateToCart),errorHandler(cartController.updateToCart))  
router.patch('/deleteProduct',isAuth(cartRoles.deleteProduct),validationCoreFunction(deleteProductSchema),errorHandler(cartController.deleteProduct))  
router.patch('/deleteProduct2',isAuth(cartRoles.deleteProduct),validationCoreFunction(deleteProductSchema),errorHandler(cartController.deleteProduct2))  
router.patch('/clearCart',isAuth(cartRoles.deleteProduct),validationCoreFunction(deleteCartSchema),errorHandler(cartController.clearCart))  
router.delete('/deleteCart',isAuth(cartRoles.deleteProduct),validationCoreFunction(deleteCartSchema),errorHandler(cartController.deleteCart))  




export default router