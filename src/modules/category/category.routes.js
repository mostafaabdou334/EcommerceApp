
import { Router } from "express";
import { allowedExtensions, multerCloudFunction } from "../../services/multerCloud.js";
import * as categoryControllers from './category.controller.js'
import { errorHandler } from "../../utilities/errorHandling.js";
import { validationCoreFunction } from "../../middleware/validation.js";
import { createCategorySchema, deleteCategorySchema, updateCategorySchema } from "./category.validationSchema.js";

// to access subCategoryRouters from category 
import  subCategoryRouters  from "../subCategory/subCategory.routes.js";
import { isAuth } from "../../middleware/auth.js";
import { systemRoles } from "../../utilities/systemRoles.js";
import { categoryRoles } from "./category.roles.js";


const router = Router()

//////////////////////////////////////////////////////////////////////////////////

// to access subCategoryRouters from category 
router.use('/:categoryId/subCategory',subCategoryRouters)

////////////////////////////////////////////////////////////////////////////////

router.post('/createCategory',isAuth(categoryRoles.createCategory),multerCloudFunction(allowedExtensions.Image).single('picture') ,validationCoreFunction(createCategorySchema),errorHandler(categoryControllers.createCategory))  
router.put('/updateCategory/:categoryId',isAuth(categoryRoles.updateCategory),multerCloudFunction(allowedExtensions.Image).single('picture'),validationCoreFunction(updateCategorySchema),errorHandler(categoryControllers.updateCategory))  
router.get('/getAllCategories',errorHandler(categoryControllers.getAllCategories))
router.get('/getAllCategoriesVirtual',errorHandler(categoryControllers.getAllCategoriesVirtual))
router.delete('/deleteCategory/:categoryId',isAuth(categoryRoles.deleteCategory),validationCoreFunction(deleteCategorySchema),errorHandler(categoryControllers.deleteCategory))



export default router