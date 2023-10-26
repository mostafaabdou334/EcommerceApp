import { brandModel } from "../../../database/model/brand.model.js"
import { categoryModel } from "../../../database/model/category.model.js"
import { productModel } from "../../../database/model/product.model.js"
import { subCategoryModel } from "../../../database/model/subCategory.model.js"
import { AppError } from "../../utilities/AppError.js"
import cloudinary from "../../utilities/cloudinary.config.js"
import { customAlphabet } from "nanoid"
import slugify from "slugify"

const nanoid = customAlphabet('12345ABCDzxer', 5)

// 1- create subCategory ....

export const createSubCategory = async (req, res, next) => {

    const { _id } = req.authUser
    const { name } = req.body
    const { categoryId } = req.params

    // check category ...
    const categoryCheck = await categoryModel.findById(categoryId)
    if (!categoryCheck) {
        return next(new AppError('your category is not exist', 400))
    }

    // check name ...
    const subCategoryCheck = await subCategoryModel.findOne({ name })
    if (subCategoryCheck) {
        return next(new AppError('your subCategory name is already exist', 400))
    }

    const slug = slugify(name, '_')

    // check image uploading .
    if (!req.file) {
        return next(new AppError('please upload subCategory picture', 400))
    }

    const customId = nanoid()
    // upload image to cloudinary .
    const { public_id, secure_url } = await cloudinary.uploader.upload(req.file.path, {
        folder: `E-commerce/categories/${categoryCheck.customId}/subcategories/${customId}`,
    })

    const cloudPath = `E-commerce/categories/${categoryCheck.customId}/subcategories/${customId}`
    // if i enter in catch error so i need to delete this folder .
    req.imagePath = `E-commerce/categories/${categoryCheck.customId}/subcategories/${customId}`

    // create category and save it in dataBase .
    const subCategoryObject = {
        name,
        slug,
        image: { public_id, secure_url },
        cloudPath,
        customId,
        categoryId,
        createdBy: _id
    }

    const subCategory = await subCategoryModel.create(subCategoryObject)
    req.failedDocument = { model: subCategoryModel, _id: subCategory._id }

    if (!subCategory) {

        const resultData = await cloudinary.uploader.destroy(public_id)
        return next(new AppError('please try again later , fail to add subCategory', 400))

    }

    return res.status(200).json({ message: 'success', subCategory })

}

//////////////////////////////////////////////////////////////////////////////////

// 2- update subCategory ....

export const updateSubCategory = async (req, res, next) => {

    const { _id } = req.authUser
    const { name } = req.body
    const { subCategoryId } = req.params


    // check if this subCategory is exist or not ....
    const checkSubCategory = await subCategoryModel.findOne({ _id: subCategoryId, createdBy: _id })
    if (!checkSubCategory) {
        return next(new AppError("your subCategory is not exist ...", 409))
    }

    if (name) {

        // check if old name is equal new name or not
        if (checkSubCategory.name == name.toLowerCase()) {
            return next(new AppError("your subCategory name is similar to old name  ...", 409))
        }

        // check that this name is unique
        const checkSubCategoryName = await subCategoryModel.findOne({ name })
        if (checkSubCategoryName) {
            return next(new AppError("your subCategory name is similar to another subCategory ...", 409))
        }


        checkSubCategory.name = name;
        checkSubCategory.slug = slugify(name, '_')
    }

    if (req.file) {

        const resultData = await cloudinary.uploader.destroy(checkSubCategory.image.public_id)
        // upload image to cloudinary .
        const { public_id, secure_url } = await cloudinary.uploader.upload(req.file.path, {
            folder: checkSubCategory.cloudPath, // helped me instead of get categoryModel to get its path
        })

        checkSubCategory.image = { public_id, secure_url }

    }

    await checkSubCategory.save()
    return res.status(200).json({ message: 'success', checkSubCategory })

}

//////////////////////////////////////////////////////////////////////////////////

//3- delete subCategories

export const deleteSubCategory = async (req, res, next) => {

    const { _id } = req.authUser
    const {subCategoryId } = req.params

    const checkSubCategoryExist = await subCategoryModel.findOneAndDelete({ _id: subCategoryId, createdBy: _id })

    if (!checkSubCategoryExist) {

        return next(new AppError("your subCategory is not exist ...", 409))
    }

    // delete folder from host...but we can not delete any folder have inside it photos ... so i should delete these photos  first by using =>( cloudinary.api.delete_resources_by_prefix() )then delete this folders by using =>( cloudinary.api.delete_folder() ) and give it the path of this folders
    await cloudinary.api.delete_resources_by_prefix(`${checkSubCategoryExist.cloudPath}`)  // to delete all photos inside every folder in this path and give it the path of this folders
    await cloudinary.api.delete_folder(`${checkSubCategoryExist.cloudPath}`)  // now i can delete this folder after deleting every photos inside it

    // delete all related in dataBase
    const deleteRelatedSubCategory = await subCategoryModel.deleteMany({ subCategoryId: checkSubCategoryExist._id })
    const deleteRelatedBrand = await brandModel.deleteMany({ subCategoryId: checkSubCategoryExist._id })
    const deleteRelatedProduct = await productModel.deleteMany({ subCategoryId: checkSubCategoryExist._id })



    return res.status(200).json({ message: 'success' })

}

//////////////////////////////////////////////////////////////////////////////////

//4- get all subCategories and its category and cratedBy...

export const getAllSubCategories = async (req, res, next) => {

    const subCategory = await subCategoryModel.find().populate([{ path: 'categoryId', select: ['name'] }, { path: 'createdBy', select: ['userName'] }])

    return res.status(200).json({ message: 'success', subCategory })
}

//////////////////////////////////////////////////////////////////////////////////


//5- get all getSubCategory and its category and cratedBy...

export const getSubCategory = async (req, res, next) => {

    const { categoryId, subCategoryId } = req.params
    const subCategory = await subCategoryModel.findOne({ _id: subCategoryId, categoryId }).populate([{ path: 'categoryId', select: ['name'] }, { path: 'createdBy', select: ['userName'] }])
    if (!subCategory) {
        return next(new AppError("your subCategory is not exist ...", 409))
    }
    return res.status(200).json({ message: 'success', subCategory })
}

/////////////////////////////////////////////////////////////////////////////////////////////
//6- get all subCategories and its category and cratedBy and its brands and products by virtual...

export const getAllSubCategoriesVirtual = async (req, res, next) => {

    const subCategory = await subCategoryModel.find().populate([

        { path: 'categoryId', select: ['name'] },
        { path: 'createdBy', select: ['userName'] },
        { path: 'brands', select: ['name'], populate:[{ path:'products', select: ['name'] }] }
    ])

    return res.status(200).json({ message: 'success', subCategory })
}