import { categoryModel } from "../../../database/model/category.model.js"
import cloudinary from "../../utilities/cloudinary.config.js"
import { AppError } from "../../utilities/AppError.js"
import slugify from "slugify"
import { customAlphabet } from "nanoid"
import { subCategoryModel } from "../../../database/model/subCategory.model.js"
import { brandModel } from "../../../database/model/brand.model.js"
import { productModel } from "../../../database/model/product.model.js"

const nanoid = customAlphabet('12345ABCDzxer', 5)

// 1- create category ...

export const createCategory = async (req, res, next) => {

    const { _id } = req.authUser
    const { name } = req.body;
    const slug = slugify(name, '_')

    // check category name exist.
    const categoryCheck = await categoryModel.findOne({ name })
    if (categoryCheck) {
        return next(new AppError("your category name is already exist ...", 409))
    }

    // check image uploading .
    if (!req.file) {
        return next(new AppError('please upload category picture', 400))
    }

    const customId = nanoid()
    // upload image to cloudinary .
    const { public_id, secure_url } = await cloudinary.uploader.upload(req.file.path, {
        folder: `E-commerce/categories/${customId}`,
    })

    // if i enter in catch error so i need to delete this folder .
    req.imagePath = `E-commerce/categories/${customId}`

    // create category and save it in dataBase .
    const categoryObject = {
        name,
        slug,
        image: { public_id, secure_url },
        customId,
        createdBy: _id
    }

    const category = await categoryModel.create(categoryObject)
    if (!category) {

        const resultData = await cloudinary.uploader.destroy(public_id)
        return next(new AppError('please try again later , fail to add category', 400))

    }

    return res.status(200).json({ message: 'success', category })


}

/////////////////////////////////////////////////////////////////////////////////////////

// 2- updateCategory ...

export const updateCategory = async (req, res, next) => {

    const { _id } = req.authUser
    const { categoryId } = req.params
    const { name } = req.body;

    // check if this category is exist or not ....
    const checkCategory = await categoryModel.findOne({ _id: categoryId, createdBy: _id })
    if (!checkCategory) {
        return next(new AppError("your category is not exist ...", 409))
    }

    if (name) {

        // check if old name is equal new name or not
        if (checkCategory.name == name.toLowerCase()) {
            return next(new AppError("your category name is similar to old name  ...", 409))
        }

        // check that this name is unique
        const checkCategoryName = await categoryModel.findOne({ name })
        if (checkCategoryName) {
            return next(new AppError("your category name is similar to another category ...", 409))
        }


        checkCategory.name = name;
        checkCategory.slug = slugify(name, '_')
    }

    if (req.file) {

        // we can not use (delete_resources_by_prefix(checkCategory.cloudPath)) as it will delete all photos inside every folder in this folder
        const resultData = await cloudinary.uploader.destroy(checkCategory.image.public_id)

        // upload image to cloudinary .
        const { public_id, secure_url } = await cloudinary.uploader.upload(req.file.path, {
            folder: `E-commerce/categories/${checkCategory.customId}`,
        })

        checkCategory.image = { public_id, secure_url }
        // if i enter in catch error so i need to delete this folder .
        req.imagePath = `E-commerce/categories/${checkCategory.customId}`
    }

    await checkCategory.save()
    return res.status(200).json({ message: 'success', checkCategory })

}

/////////////////////////////////////////////////////////////////////////////////////////

//3- get all categories and its subCategory...
// first method to get getAllCategories with its subCategories....

export const getAllCategories = async (req, res, next) => {


    // first method to get getAllCategories with its subCategories....
    // this method do not save in database but show only in response

    const getAllCategories = await categoryModel.find()
    const categoryArr = []
    for (const category of getAllCategories) {

        const subCategory = await subCategoryModel.find({ categoryId: category._id })
        const objectCat = category.toObject()   // to convert category from BSON to object to can add any thing in it .
        objectCat.subcategories = subCategory   // here i will generate new field in category called subCategory
        categoryArr.push(objectCat)
    }

    return res.status(200).json({ message: 'success', categoryArr })

}

/////////////////////////////////////////////////////////////////////////////////////////

//4- get all categories and its subCategory...( most use )
// second method by using virtual (most use)

export const getAllCategoriesVirtual = async (req, res, next) => {


    // 1- make real populate on categoryModel to get information about createdBy ...
    // const getAllCategories = await categoryModel.find().populate([{path: 'createdBy', select: ['userName']}])

    // 2- make virtual populate on categoryModel to get information about subCategory ...
    // const getAllCategories = await categoryModel.find().populate([{ path: 'subCategories', select: ['name'] }])

    // 3- make real populate and virtual populate on categoryModel to get information about (createdBy) and (subCategory) ...
    // const getAllCategories = await categoryModel.find().populate([{ path: 'createdBy', select: ['userName'] },{ path: 'subCategories', select: ['name']}])

    // 4- make real populate and virtual populate on categoryModel to get information about (createdBy) and (subCategory and   createdBy of this subCategory) ...
    // const getAllCategories = await categoryModel.find().populate([{ path: 'createdBy', select: ['userName'] },{ path: 'subCategories', select: ['name'] ,populate: [{ path: 'createdBy', select: ['userName'] }] }])

    // 5- make real populate and virtual populate on categoryModel to get information about (createdBy) and (subCategory and   brands of this subCategory) ...
    //  const getAllCategories = await categoryModel.find().populate([{ path: 'createdBy', select: ['userName'] },{ path: 'subCategories', select: ['name'] ,populate: [{ path: 'brands', select: ['name'] }] }])

    // 6- make real populate and virtual populate on categoryModel to get information about (createdBy) and (subCategory and   brands of this subCategory and createdBy of this subCategory) ...
    // const getAllCategories = await categoryModel.find().populate([{ path: 'createdBy', select: ['userName'] },{ path: 'subCategories', select: ['name'] ,populate: [{ path: 'brands', select: ['name'] },{ path: 'createdBy', select: ['userName'] }] }])

    // 7- make real populate and virtual populate on categoryModel to get information about (createdBy) and (subCategory and   brands of this subCategory and products of this brands) ...
    const getAllCategories = await categoryModel.find().populate([{ path: 'createdBy', select: ['userName'] }, { path: 'subCategories', select: ['name'], populate: [{ path: 'brands', select: ['name'], populate: [{ path: 'products', select: ['name'] }] }] }])



    // populate([{path:'subCategories'}]) => this path is the field that i made it in virual in category schema
    return res.status(200).json({ message: 'success', getAllCategories })

}

/////////////////////////////////////////////////////////////////////////////////////////


//5- delete category

export const deleteCategory = async (req, res, next) => {

    const { _id } = req.authUser
    const { categoryId } = req.params

    const checkCategoryExist = await categoryModel.findOneAndDelete({ _id: categoryId, createdBy: _id })

    if (!checkCategoryExist) {

        return next(new AppError("your category is not exist ...", 409))
    }

    // delete folder from host...but we can not delete any folder have inside it photos ... so i should delete these photos  first by using =>( cloudinary.api.delete_resources_by_prefix() )then delete this folders by using =>( cloudinary.api.delete_folder() ) and give it the path of this folders
    await cloudinary.api.delete_resources_by_prefix(`E-commerce/categories/${checkCategoryExist.customId}`)  // to delete all photos (inside every folder) in this path and give it the path of this folders
    await cloudinary.api.delete_folder(`E-commerce/categories/${checkCategoryExist.customId}`)  // now i can delete this folder after deleting every photos inside it

    // delete all related in dataBase
    const deleteRelatedSubCategory = await subCategoryModel.deleteMany({ categoryId: checkCategoryExist._id })
    const deleteRelatedBrand = await brandModel.deleteMany({ categoryId: checkCategoryExist._id })
    const deleteRelatedProduct = await productModel.deleteMany({ categoryId: checkCategoryExist._id })



    return res.status(200).json({ message: 'success' })

}