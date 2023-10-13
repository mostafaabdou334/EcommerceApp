
import { Router } from "express";
import { allowedExtensions, multerCloudFunction } from "../../services/multerCloud.js";
import { validationCoreFunction } from "../../middleware/validation.js";
import { errorHandler } from "../../utilities/errorHandling.js";
import * as brandController from './barand.controller.js'
import { createBrandSchema, deleteBrandSchema, updateBrandSchema } from "./barand.validationSchema.js";
import { isAuth } from "../../middleware/auth.js";
import { brandRoles } from "./brand.roles.js";


const router = Router()




//2- to access brandRouters from brand path

router.post('/createBrand',multerCloudFunction(allowedExtensions.Image).single('picture'),isAuth(brandRoles.createBrand),validationCoreFunction(createBrandSchema),errorHandler(brandController.createBrand))  
router.put('/updateBrand/:brandId', isAuth(brandRoles.updateBrand), multerCloudFunction(allowedExtensions.Image).single('picture'), validationCoreFunction(updateBrandSchema), errorHandler(brandController.updateBrand))
router.delete('/deleteBrand/:brandId', isAuth(brandRoles.deleteBrand),validationCoreFunction(deleteBrandSchema), errorHandler(brandController.deleteBrand))
router.get('/getAllBrands',errorHandler(brandController.getAllBrands))
router.get('/getBrand',errorHandler(brandController.getBrand))
router.get('/getAllBrandsVirtual/',errorHandler(brandController.getAllBrandsVirtual))



export default router