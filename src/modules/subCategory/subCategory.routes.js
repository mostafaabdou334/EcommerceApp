
import { Router } from "express";
import * as subCategoryController from './subCategory.controller.js'
import { errorHandler } from "../../utilities/errorHandling.js";
import { validationCoreFunction } from "../../middleware/validation.js";
import { allowedExtensions, multerCloudFunction } from "../../services/multerCloud.js";
import { createSubCategorySchema, deleteSubCategorySchema, updateSubCategorySchema } from "./subCategory.validationSchema.js";
import { isAuth } from "../../middleware/auth.js";
import { subCategoryRoles } from "./subCategory.roles.js";

// 1- to access subCategoryRouters from category to create category ( more use)
const router = Router({ mergeParams: true })

router.post('/createSubCategory', isAuth(subCategoryRoles.createSubCategory), multerCloudFunction(allowedExtensions.Image).single('picture'), validationCoreFunction(createSubCategorySchema), errorHandler(subCategoryController.createSubCategory))
router.put('/updateSubCategory/:subCategoryId', isAuth(subCategoryRoles.updateSubCategory), multerCloudFunction(allowedExtensions.Image).single('picture'), validationCoreFunction(updateSubCategorySchema), errorHandler(subCategoryController.updateSubCategory))
router.delete('/deleteSubCategory/:subCategoryId', isAuth(subCategoryRoles.deleteSubCategory),validationCoreFunction(deleteSubCategorySchema), errorHandler(subCategoryController.deleteSubCategory))
router.get('/getAllSubCategories',errorHandler(subCategoryController.getAllSubCategories))
router.get('/getSubCategory/:subCategoryId',errorHandler(subCategoryController.getSubCategory))

// router.get('/getAllSubCategoriesVirtual',errorHandler(subCategoryController.getAllSubCategoriesVirtual))

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


//2- to access subCategoryRouters from subCategory path
router.post('/createSubCategory/:categoryId', isAuth(subCategoryRoles.createSubCategory), multerCloudFunction(allowedExtensions.Image).single('picture'), validationCoreFunction(createSubCategorySchema), errorHandler(subCategoryController.createSubCategory))
router.put('/updateSubCategory/:subCategoryId', isAuth(subCategoryRoles.updateSubCategory), multerCloudFunction(allowedExtensions.Image).single('picture'), validationCoreFunction(updateSubCategorySchema), errorHandler(subCategoryController.updateSubCategory))
router.delete('/deleteSubCategory/:subCategoryId', isAuth(subCategoryRoles.deleteSubCategory),validationCoreFunction(deleteSubCategorySchema), errorHandler(subCategoryController.deleteSubCategory))
router.get('/getAllSubCategories',errorHandler(subCategoryController.getAllSubCategories))
router.get('/getSubCategory/:categoryId/:subCategoryId',errorHandler(subCategoryController.getSubCategory))
router.get('/getAllSubCategoriesVirtual',errorHandler(subCategoryController.getAllSubCategoriesVirtual))




export default router