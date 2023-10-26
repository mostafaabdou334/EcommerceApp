

import slugify from "slugify";
import { brandModel } from "../../../database/model/brand.model.js";
import { categoryModel } from "../../../database/model/category.model.js";
import { subCategoryModel } from "../../../database/model/subCategory.model.js";
import { productModel } from "../../../database/model/product.model.js";
import { nanoid } from "nanoid";
import cloudinary from "../../utilities/cloudinary.config.js";
import { AppError } from "../../utilities/AppError.js";
import { paginationFunction } from "../../utilities/pagination.js";
import { ApiFeatures } from "../../utilities/apiFeatures.js";
import { reviewModel } from "../../../database/model/review.model.js";



// 1- create product ...

export const addProduct = async (req, res, next) => {

    const { _id } = req.authUser
    const { name, description, colors, sizes, price, discount, stock } = req.body;
    const { categoryId, subCategoryId, brandId } = req.query



    // check product name exist.

    const productCheck = await productModel.findOne({ name })
    if (productCheck) {
        return next(new AppError("your product name is already exist ...", 409))
    }


    // check category name exist.
    const categoryCheck = await categoryModel.findById(categoryId)
    if (!categoryCheck) {
        return next(new AppError("your category is not exist ...", 409))
    }

    // check subCategory name exist.
    const subCategoryCheck = await subCategoryModel.findOne({ _id: subCategoryId, categoryId })
    if (!subCategoryCheck) {
        return next(new AppError("your subCategory is not exist ...", 409))
    }

    // check brand name exist.
    const brandCheck = await brandModel.findOne({ _id: brandId, subCategoryId, categoryId })
    if (!brandCheck) {
        return next(new AppError("your brand is not exist ...", 409))
    }

    const slug = slugify(name, '_')

    // check image uploading .
    if (!req.files.length) {
        return next(new AppError('please upload product pictures', 400))
    }
    const customId = nanoid()
    // upload image to cloudinary .
    let coverImages = []
    let coverImagesPublic_ids = []


    for (const file of req.files) {

        const { public_id, secure_url } = await cloudinary.uploader.upload(file.path, {
            folder: `E-commerce/categories/${categoryCheck.customId}/subcategories/${subCategoryCheck.customId}/brand/${brandCheck.customId}/products/${customId}`,

        })

        coverImages.push({ public_id, secure_url })
        coverImagesPublic_ids.push(public_id)

    }

    req.imagePath = `E-commerce/categories/${categoryCheck.customId}/subcategories/${subCategoryCheck.customId}/brand/${brandCheck.customId}/products/${customId}`
    const cloudFolder = `E-commerce/categories/${categoryCheck.customId}/subcategories/${subCategoryCheck.customId}/brand/${brandCheck.customId}/products/${customId}`
    const priceAfterDiscount = Number.parseFloat(price - (price * ((discount || 0) / 100))).toFixed(2)


    // create category and save it in dataBase .
    const productObject = {
        name,
        slug,
        description,
        colors,
        sizes,
        price,
        discount,
        stock,
        priceAfterDiscount,
        image: coverImages,
        cloudFolder,
        customId,
        categoryId,
        subCategoryId,
        brandId,
        createdBy: _id
    }

    const product = await productModel.create(productObject)
    req.failedDocument = { model: productModel, _id: product._id }

    if (!product) {

        const resultData = await cloudinary.api.delete_resources(coverImagesPublic_ids)
        return next(new AppError('please try again later , fail to add category', 400))

    }

    return res.status(200).json({ message: 'success', product })


}

//////////////////////////////////////////////////////////////////////////////////////

// 2- update product ...

export const updateProduct = async (req, res, next) => {

    const { _id } = req.authUser
    const { name, description, colors, sizes, price, discount, stock } = req.body;
    const { productId } = req.params

    // check productId..

    const checkProduct = await productModel.findOne({ _id: productId, createdBy: _id })
    if (!checkProduct) {
        return next(new AppError("your product is not exist ...", 409))
    }

    if (price && discount) {
        checkProduct.price = price
        checkProduct.discount = discount
        const priceAfterDiscount = price - (price * ((discount || 0) / 100))
        checkProduct.priceAfterDiscount = priceAfterDiscount
    }
    else if (price) {
        checkProduct.price = price
        const priceAfterDiscount = price - (price * ((checkProduct.discount || 0) / 100))
        checkProduct.priceAfterDiscount = priceAfterDiscount

    }
    else if (discount) {
        checkProduct.discount = discount
        const priceAfterDiscount = checkProduct.price - (checkProduct.price * ((discount || 0) / 100))
        checkProduct.priceAfterDiscount = priceAfterDiscount

    }


    if (name) {

        // check if old name is equal new name or not
        if (checkProduct.name == name.toLowerCase()) {
            return next(new AppError("your product name is similar to old name  ...", 409))
        }

        // check that this name is unique
        const checkProductName = await productModel.findOne({ name })
        if (checkProductName) {
            return next(new AppError("your product name is similar to another product ...", 409))
        }


        checkProduct.name = name;
        checkProduct.slug = slugify(name, '_')
    }

    if (description) {
        checkProduct.description = description
    }


    if (colors) {
        checkProduct.colors = colors
    }

    if (sizes) {
        checkProduct.sizes = sizes
    }

    if (stock) {

        checkProduct.stock = stock
    }



    // upload image to cloudinary .

    if (req.files?.length) {

        let coverImages = []
        let coverImagesPublic_ids = []


        // get old images from database
        for (const image of checkProduct.image) {
            coverImagesPublic_ids.push(image.public_id)
        }

        // delete old images from cloudinary ...
        const resultData = await cloudinary.api.delete_resources(coverImagesPublic_ids)
        // await cloudinary.api.delete_resources_by_prefix(`${checkProduct.cloudFolder}`)  // to delete all photos inside every folder in this path and give it the path of this folders
        // await cloudinary.api.delete_folder(`${checkProduct.cloudFolder}`)  // now i can delete this folder after deleting every photos inside it

        // upload image to cloudinary .
        for (const file of req.files) {

            const { public_id, secure_url } = await cloudinary.uploader.upload(file.path, {

                folder: `${checkProduct.cloudFolder}`,
                // folder: `E-commerce/categories/${categoryCheck.customId}/subcategories/${subCategoryCheck.customId}/brand/${brandCheck.customId}/products/${checkProduct.customId}`,

            })

            coverImages.push({ public_id, secure_url })

        }

        // save new images in database 
        checkProduct.image = coverImages
        //so now checkProduct.image has only new images ...

        req.imagePath = `${checkProduct.cloudFolder}`
        // req.imagePath = `E-commerce/categories/${categoryCheck.customId}/subcategories/${subCategoryCheck.customId}/brand/${brandCheck.customId}/products/${checkProduct.cloudFolder}`
        // checkProduct.cloudFolder = `E-commerce/categories/${categoryCheck.customId}/subcategories/${subCategoryCheck.customId}/brand/${brandCheck.customId}/products/${checkProduct.customId}`

    }
    await checkProduct.save()
    res.status(200).json({ message: "success", checkProduct })
}

//////////////////////////////////////////////////////////////////////////////////////

//3- delete product

export const deleteProduct = async (req, res, next) => {

    const { _id } = req.authUser
    const { productId } = req.params

    const checkProductExist = await productModel.findOneAndDelete({ _id: productId, createdBy: _id })

    if (!checkProductExist) {

        return next(new AppError("your product is not exist ...", 409))
    }

    // delete folder from host...but we can not delete any folder have inside it photos ... so i should delete these photos  first by using =>( cloudinary.api.delete_resources_by_prefix() )then delete this folders by using =>( cloudinary.api.delete_folder() ) and give it the path of this folders
    await cloudinary.api.delete_resources_by_prefix(`${checkProductExist.cloudFolder}`)  // to delete all photos inside every folder in this path and give it the path of this folders
    await cloudinary.api.delete_folder(`${checkProductExist.cloudFolder}`)  // now i can delete this folder after deleting every photos inside it

    // delete all related in dataBase
    const deleteRelatedReview = await reviewModel.deleteMany({ productId: checkProductExist._id })



    return res.status(200).json({ message: 'success' })

}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////

// 4- get all products ...using pagination

export const getAllProducts = async (req, res, next) => {

    const { page, size } = req.query  // query is the best place to send page and size
    const { limit, skip } = paginationFunction({ page, size })

    const product = await productModel.find().limit(limit).skip(skip)

    res.status(200).json({ message: 'success', product })
}


/////////////////////////////////////////////
export const getAllProductsvirualReviews = async (req, res, next) => {

    const { page, size } = req.query  // query is the best place to send page and size
    const { limit, skip } = paginationFunction({ page, size })

    const product = await productModel.find().limit(limit).skip(skip).populate([{ path: "Reviews", select: ['reviewRate', 'reviewComment'] }])

    res.status(200).json({ message: 'success', product })
}

/////////////////////////////////////////////

export const getAllProductsVirual = async (req, res, next) => {

    const products = await productModel.find().populate([{ path: 'categoryId', select: ['name'] }, { path: 'subCategoryId', select: ['name'] }, { path: 'brandId', select: ['name'] }, { path: "Reviews", select: ['reviewRate', 'reviewComment'] }])
    // populate([{path:'subCategories'}]) => this path is the field that i made it in virual in category schema
    return res.status(200).json({ message: 'success', products })

}
//////////////////////////////////////////////////////////////////////////////////////

// 3- get  products by name ...(search)

export const getAllProductsByName = async (req, res, next) => {

    const { page, size, searchKey } = req.query  // query is the best place to send page and size
    const { limit, skip } = paginationFunction({ page, size })

    const product = await productModel.find({ $or: [{ name: { $regex: searchKey, $options: 'i' } }, { slug: { $regex: searchKey, $options: 'i' } }, { description: { $regex: searchKey, $options: 'i' } }] }).limit(limit).skip(skip)  // {$regex : name} => it will search which (name => (contain name))

    res.status(200).json({ message: 'success', product })
}

//////////////////////////////////////////////////////////////////////////////////////

// 4- get  products features (sort , select , filter) without using class

export const listProducts = async (req, res, next) => {

    // ===================================> sort <=========================================================

    // const product = await productModel.find().sort('name') // will sort ascending from low to high 
    // const product = await productModel.find().sort('-name') // will sort descending from high to low 
    // const product = await productModel.find().sort('price') // will sort ascending from low to high 
    // const product = await productModel.find().sort('-price') // will sort descending from high to low 
    // const product = await productModel.find().sort('-name price') // will sort descending from high to low form name then we will make sort ascending for this output in price

    // const { sort } = req.query
    // sort will be like that 'name,price' so we should convert it to 'name price' so we used => (sort.replace(',',' ') )
    // const product = await productModel.find().sort(sort.replace(',',' ')) 
    // res.status(200).json({ message: 'success', product })


    // ===================================> select <=========================================================


    // const product = await productModel.find().select('name') // will select name and _id only
    // const product = await productModel.find().select('name price') // will select name and price and _id only
    // const product = await productModel.find().select('name price -_id') // will select name and without _id only

    // const { select } = req.query
    // const product = await productModel.find().select(select.replaceAll(',', ' ')) // replaceAll => to replace all ( , ) with space 
    // res.status(200).json({ message: 'success', product })

    // ===================================> filter <=========================================================

    // const product = await productModel.find({ price: { $gte: 5000 } })

    const queryInstance = { ...req.query }
    const execuldKeyArr = ['page', 'size', 'sort', 'select']
    execuldKeyArr.forEach((key) => { delete queryInstance[key] }) // here i delete from (queryInstance) any thing inside (execuldKeyArr)

    // all below after deleting any thing inside (execuldKeyArr) from (queryInstance)
    const queryString = JSON.stringify(queryInstance).replace(/gt|gte|lt|lte|eq|ne|in|nin|and|or|not|regex/g, (match) => `$${match}`)
    const queryJson = JSON.parse(queryString)
    console.log(queryJson)
    const product = await productModel.find(queryJson).select(req.query.select?.replaceAll(',', ' ')).sort(req.query.sort?.replace(',', ' '))

    res.status(200).json({ message: 'success', product })

}

//////////////////////////////////////////////////////////////////////////////////////

// 5- get  products features (sort , select , filter) but by using class


// at first i need you to now that ....
//  #1-  const product = await productModel.find() => that we did it to find all data from productModel
//  #2-  const product = productModel.find()  => its called (mongooseQuery)
//  #3-  const data = await product  => its not has any relation to mongooseQuery , i just await only
//  #4-  if i tried it ... it will work correctly.



// 5-1 pagination by class ...

export const ApiFeaturesClassPagination = async (req, res, next) => {

    const ApiFeaturesInstance = new ApiFeatures(productModel.find(), req.query).pagination()
    const products = await ApiFeaturesInstance.mongooseQuery
    res.status(200).json({ message: 'success', products })

}

//////////////////////////////////////////////////////////////////////////////////////

// 5-2 sort by class ...

export const ApiFeaturesClassSort = async (req, res, next) => {

    const ApiFeaturesInstance = new ApiFeatures(productModel.find(), req.query).sortMethod()
    const products = await ApiFeaturesInstance.mongooseQuery
    res.status(200).json({ message: 'success', products })

}

//////////////////////////////////////////////////////////////////////////////////////

// 5-3 select by class ...

export const ApiFeaturesClassSelect = async (req, res, next) => {

    const ApiFeaturesInstance = new ApiFeatures(productModel.find(), req.query).selectMethod()
    const products = await ApiFeaturesInstance.mongooseQuery
    res.status(200).json({ message: 'success', products })

}

//////////////////////////////////////////////////////////////////////////////////////

// 5-4 filter by class ...

export const ApiFeaturesClassFilter = async (req, res, next) => {

    const ApiFeaturesInstance = new ApiFeatures(productModel.find(), req.query).filterMethod()
    const products = await ApiFeaturesInstance.mongooseQuery
    res.status(200).json({ message: 'success', products })

}

//////////////////////////////////////////////////////////////////////////////////////

// 5-5 mix between sort , select , filter by class ...

export const ApiFeaturesClassMix = async (req, res, next) => {

    const ApiFeaturesInstance = new ApiFeatures(productModel.find(), req.query).sortMethod().selectMethod().filterMethod()
    const products = await ApiFeaturesInstance.mongooseQuery
    res.status(200).json({ message: 'success', products })

}

//////////////////////////////////////////////////////////////////////////////////////