
import { Router } from "express";
import { allowedExtensions, multerCloudFunction } from "../../services/multerCloud.js";
import { validationCoreFunction } from "../../middleware/validation.js";
import { errorHandler } from "../../utilities/errorHandling.js";
import * as productController from './product.controller.js'
import { addProductSchema, deleteProductSchema, updateProductSchema } from "./product.validationSchema.js";
import { isAuth } from "../../middleware/auth.js";
import { productRoles } from "./product.roles.js";


const router = Router()

router.post('/addProduct',isAuth(productRoles.addProduct),multerCloudFunction(allowedExtensions.Image).array('picture'),validationCoreFunction(addProductSchema),errorHandler(productController.addProduct))  
router.put('/updateProduct/:productId',isAuth(productRoles.updateProduct),multerCloudFunction(allowedExtensions.Image).array('cover'),validationCoreFunction(updateProductSchema),errorHandler(productController.updateProduct))  
router.delete('/deleteProduct/:productId',isAuth(productRoles.deleteProduct),validationCoreFunction(deleteProductSchema),errorHandler(productController.deleteProduct))  

router.get('/getAllProducts',errorHandler(productController.getAllProducts))  

router.get('/getAllProductsvirualReviews',errorHandler(productController.getAllProductsvirualReviews))
router.get('/getAllProductsVirual',errorHandler(productController.getAllProductsVirual))


router.get('/getAllProductsByName',errorHandler(productController.getAllProductsByName))  
router.get('/listProducts',errorHandler(productController.listProducts)) 

// class methods ...
router.get('/ApiFeaturesClassPagination',errorHandler(productController.ApiFeaturesClassPagination))  
router.get('/ApiFeaturesClassSort',errorHandler(productController.ApiFeaturesClassSort))  
router.get('/ApiFeaturesClassSelect',errorHandler(productController.ApiFeaturesClassSelect))  
router.get('/ApiFeaturesClassFilter',errorHandler(productController.ApiFeaturesClassFilter))  
router.get('/ApiFeaturesClassMix',errorHandler(productController.ApiFeaturesClassMix))  







export default router