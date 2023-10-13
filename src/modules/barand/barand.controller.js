

import slugify from "slugify";
import { brandModel } from "../../../database/model/brand.model.js";
import { categoryModel } from "../../../database/model/category.model.js";
import { subCategoryModel } from "../../../database/model/subCategory.model.js";
import { nanoid } from "nanoid";
import cloudinary from "../../utilities/cloudinary.config.js";
import { AppError } from "../../utilities/AppError.js";
import { productModel } from "../../../database/model/product.model.js";



// 1- createBrand ...

export const createBrand = async (req, res, next) => {

    const { _id } = req.authUser
    const { name } = req.body;
    const { categoryId, subCategoryId } = req.query

    // check category name exist.
    const categoryCheck = await categoryModel.findById(categoryId)
    if (!categoryCheck) {
        return next(new AppError("your category name is not exist ...", 409))
    }

    // check subCategory name exist.
    const subCategoryCheck = await subCategoryModel.findById(subCategoryId)
    if (!subCategoryCheck) {
        return next(new AppError("your subCategory name is not exist ...", 409))
    }

    // check subCategory name exist.
    const BrandCheck = await brandModel.findOne({ name })
    if (BrandCheck) {
        return next(new AppError("your Brand name is already exist ...", 409))
    }

    const slug = slugify(name, '_')

    // check image uploading .
    if (!req.file) {
        return next(new AppError('please upload category picture', 400))
    }

    const customId = nanoid()
    // upload image to cloudinary .
    const { public_id, secure_url } = await cloudinary.uploader.upload(req.file.path, {
        folder: `E-commerce/categories/${categoryCheck.customId}/subcategories/${subCategoryCheck.customId}/brand/${customId}`,
    })

    // if i enter in catch error so i need to delete this folder .
    const cloudPath = `E-commerce/categories/${categoryCheck.customId}/subcategories/${subCategoryCheck.customId}/brand/${customId}`
    req.imagePath = `E-commerce/categories/${categoryCheck.customId}/subcategories/${subCategoryCheck.customId}/brand/${customId}`

    // create category and save it in dataBase .
    const brandObject = {
        name,
        slug,
        image: { public_id, secure_url },
        customId,
        cloudPath,
        categoryId,
        subCategoryId,
        createdBy: _id
    }


    const brand = await brandModel.create(brandObject)
    if (!brand) {

        const resultData = await cloudinary.uploader.destroy(public_id)
        return next(new AppError('please try again later , fail to add category', 400))

    }

    return res.status(200).json({ message: 'success', brand })


}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////

// 2- updateBrand ....

export const updateBrand = async (req, res, next) => {

    const { _id } = req.authUser
    const { name } = req.body
    const { brandId } = req.params




    // check subCategory name exist.... ( it will help me to update in cloudinary )
    const BrandCheck = await brandModel.findOne({ _id: brandId, createdBy: _id })
    if (!BrandCheck) {
        return next(new AppError("your Brand is not exist ...", 409))
    }

    if (name) {

        // check if old name is equal new name or not
        if (BrandCheck.name == name.toLowerCase()) {
            return next(new AppError("your brand name is similar to old name  ...", 409))
        }

        // check that this name is unique
        const checkBrandName = await brandModel.findOne({ name })
        if (checkBrandName) {
            return next(new AppError("your brand name is similar to another brand ...", 409))
        }


        BrandCheck.name = name;
        BrandCheck.slug = slugify(name, '_')
    }

    if (req.file) {

        const resultData = await cloudinary.uploader.destroy(BrandCheck.image.public_id)

        // upload image to cloudinary .
        const { public_id, secure_url } = await cloudinary.uploader.upload(req.file.path, {
            folder: `${BrandCheck.cloudPath}`,
        })

        BrandCheck.image = { public_id, secure_url }

    }

    await BrandCheck.save()
    return res.status(200).json({ message: 'success', BrandCheck })

}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////

//3- delete brand

export const deleteBrand = async (req, res, next) => {

    const { _id } = req.authUser
    const { brandId } = req.params

  
    const checkBrandExist = await brandModel.findOneAndDelete({ _id: brandId, createdBy: _id })

    if (!checkBrandExist) {

        return next(new AppError("your brand is not exist ...", 409))
    }

    // delete folder from host...but we can not delete any folder have inside it photos ... so i should delete these photos  first by using =>( cloudinary.api.delete_resources_by_prefix() )then delete this folders by using =>( cloudinary.api.delete_folder() ) and give it the path of this folders
    await cloudinary.api.delete_resources_by_prefix(`${checkBrandExist.cloudPath}`)  // to delete all photos inside every folder in this path and give it the path of this folders
    await cloudinary.api.delete_folder(`${checkBrandExist.cloudPath}`)  // now i can delete this folder after deleting every photos inside it

    // delete all related in dataBase
    const deleteRelatedProduct = await productModel.deleteMany({ brandId })



    return res.status(200).json({ message: 'success' })

}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////

//4- get all brands and its category and cratedBy and subCategories...

export const getAllBrands = async (req, res, next) => {

    const getAllBrands = await brandModel.find().populate([{ path: 'categoryId', select: ['name'] }, { path: 'createdBy', select: ['userName'] } , { path: 'subCategoryId', select: ['name'] }])

    return res.status(200).json({ message: 'success', getAllBrands })
}


/////////////////////////////////////////////////////////////////////////////////////////////////////////////

//5- get brand and its category and cratedBy and subCategories...

export const getBrand= async (req, res, next) => {
    const { categoryId, subCategoryId , brandId } = req.query

    const Brand = await brandModel.findOne({_id:brandId , categoryId , subCategoryId}).populate([{ path: 'categoryId', select: ['name'] }, { path: 'createdBy', select: ['userName'] } , { path: 'subCategoryId', select: ['name'] }])

    return res.status(200).json({ message: 'success', Brand })
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////

//6- get all brands and its category and cratedBy and its brands and products by virtual...

export const getAllBrandsVirtual = async (req, res, next) => {

    const Brands = await brandModel.find().populate([

        { path: 'categoryId', select: ['name'] },
        { path: 'subCategoryId', select: ['name'] },
        { path: 'createdBy', select: ['userName'] },
        { path: 'products', select: ['name'] }])

    return res.status(200).json({ message: 'success', Brands })
}