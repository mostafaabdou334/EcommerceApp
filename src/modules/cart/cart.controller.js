

import { AppError } from "../../utilities/AppError.js"
import { productModel } from "../../../database/model/product.model.js"
import { cartModel } from "../../../database/model/cart.model.js";




// 1- add to cart  ...

export const addToCart = async (req, res, next) => {

    const { _id } = req.authUser
    const { productId, quantity } = req.body;



    // ======================> product check <============
    const productCheck = await productModel.findOne({ _id: productId, stock: { $gte: quantity } })

    if (!productCheck) {
        return next(new AppError(`invalid productId or quantity is more than stock  ...`, 409))

    }


    // ======================> cart check <============
    const userCartCheck = await cartModel.findOne({ createdBy: _id }).lean()  // .lean() => to convert from bson to json
    if (userCartCheck) {

        // update....if this product is already exist

        let productExist = false
        for (const product of userCartCheck.products) {

            if (productId == product.productId) {
                productExist = true
                product.quantity = quantity

            }
        }

        // if this product is not exist in y cart so i need to add new product....

        if (!productExist) {

            userCartCheck.products.push({ productId, quantity })
        }

        // calculate new supTotal.....
        let subTotal = 0
        for (const product of userCartCheck.products) {

            const productExist = await productModel.findById(product.productId)
            subTotal += (productExist.priceAfterDiscount * product.quantity) || 0
        }

        const updateCart = await cartModel.findOneAndUpdate({ createdBy: _id }, { products: userCartCheck.products, subTotal }, { new: true })

        return res.status(200).json({ message: 'success', updateCart })

    }


    const cartObject = {
        createdBy: _id,
        products: [{ productId, quantity }],
        subTotal: productCheck.priceAfterDiscount * quantity  // total price of all products in this cart
    }

    const userCart = await cartModel.create(cartObject)
    req.failedDocument = { model: cartModel, _id: userCart._id }

    return res.status(200).json({ message: 'success', userCart })

}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// 2- get userCart ........ 

export const userCart = async (req, res, next) => {

    const { _id } = req.authUser

    const userCart = await cartModel.findOne({ createdBy: _id }).populate([{ path: 'products.productId', select: ['name', 'image.secure_url', 'description', 'price', 'discount', 'priceAfterDiscount', 'stock', 'soldItems', 'rate'] },
    ])
    if (!userCart) {
        return next(new AppError("no cart", 409))

    }
    return res.status(200).json({ message: 'success', userCart })


}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// 3- update To Cart......

export const updateToCart = async (req, res, next) => {

    const { _id } = req.authUser
    const { productId, quantity } = req.body;

    // ======================> product check <============
    const productCheck = await productModel.findOne({ _id: productId, stock: { $gte: quantity } })

    if (!productCheck) {
        return next(new AppError(`invalid productId or quantity is more than stock as stock is ${productCheck.stock} items ...`, 409))

    }


    // ======================> cart check <============
    const userCartCheck = await cartModel.findOne({ createdBy: _id })
    if (userCartCheck) {

        let productExist = false
        for (const product of userCartCheck.products) {

            if (productId == product.productId) {
                productExist = true
                product.quantity = quantity

            }
        }

        if (!productExist) {

            return next(new AppError(`this product is not exist in your cart`, 409))
        }


        // calculate new supTotal.....
        let subTotal = 0
        for (const product of userCartCheck.products) {

            const productExist = await productModel.findById(product.productId)
            subTotal += (productExist.priceAfterDiscount * product.quantity) || 0
        }

        const updateCart = await cartModel.findOneAndUpdate({ createdBy: _id }, { products: userCartCheck.products, subTotal }, { new: true })

        return res.status(200).json({ message: 'success', updateCart })

    }


    return next(new AppError(`you do not have cart`, 409))



}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 4- delete product from cart ...(first method)

export const deleteProduct = async (req, res, next) => {

    const { _id } = req.authUser
    const { productId } = req.body;

    // ======================> product check <============
 
    const userCart = await cartModel.findOne({ createdBy: _id, 'products.productId': productId })  // products.productId':productId  => if there is productId in products so it will return (all cart) , if not so it will return null
    if (!userCart) {
        return next(new AppError(" your productId is not exist in this cart", 409))

    }

    userCart.products.forEach((ele) => {

        if (ele.productId == productId) {
            userCart.products.splice(userCart.products.indexOf(ele), 1)
        }
    })

    // calculate new supTotal.....
    let subTotal = 0
    for (const product of userCart.products) {

        const productExist = await productModel.findById(product.productId)
        subTotal += (productExist.priceAfterDiscount * product.quantity) || 0
    }
    userCart.subTotal = subTotal
    await userCart.save()


    return res.status(200).json({ message: 'success', userCart })


}


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 5- delete product from cart ...(second method)

export const deleteProduct2 = async (req, res, next) => {

    const { _id } = req.authUser
    const { productId } = req.body;

    const userCart = await cartModel.findOneAndUpdate({ createdBy: _id, 'products.productId': productId }, { $pull: { products: { productId:productId } } }, { new: true })  // products.productId':productId  => if there is productId in products so it will return (all cart) , if not so it will return null
    //{$pull:{products:{productId}}} =>
    // 1- $pull : will remove and take object has key and value
    // 2- our key will be products and it about array of objects 
    // 3- our value will be the object which productId = productId 

    if(!userCart){
        return next(new AppError("invalid productId ", 409))

    }
    // calculate new supTotal.....
    let subTotal = 0
    for (const product of userCart.products) {

        const productExist = await productModel.findById(product.productId)
        subTotal += (productExist.priceAfterDiscount * product.quantity) || 0
    }
    userCart.subTotal = subTotal
    await userCart.save()


    return res.status(200).json({ message: 'success', userCart })


}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 6- clear cart 

export const clearCart = async (req, res, next) => {

    const { _id } = req.authUser
    const { cartId } = req.query;

    const userCart = await cartModel.findOneAndUpdate({ createdBy: _id, _id: cartId },{products:[],subTotal:0},{new:true})
    if (!userCart) {
        return next(new AppError("no cart", 409))

    }

    return res.status(200).json({ message: 'success', userCart })


}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 7- delete cart 

export const deleteCart = async (req, res, next) => {

    const { _id } = req.authUser
    const { cartId } = req.query;

    const userCart = await cartModel.findOneAndDelete({ createdBy: _id, _id: cartId })
    if (!userCart) {
        return next(new AppError("no cart", 409))

    }

    return res.status(200).json({ message: 'success', userCart })


}
