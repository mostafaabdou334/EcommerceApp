import { couponModel } from "../../../database/model/coupon.model.js"
import { userModel } from "../../../database/model/user.model.js"
import { AppError } from "../../utilities/AppError.js"





// 1- add coupon ...
export const addCoupon = async (req, res, next) => {
    const { _id } = req.authUser  // coupon owner should be login in
    const { couponCode, couponAmount, isPercentageCoupon, isFixedCoupon, fromDate, TODate, couponAssignedToUser } = req.body

    const couponChecked = await couponModel.findOne({ couponCode })
    if (couponChecked) {
        return next(new AppError("your coupon code is already exist ...", 409))
    }

    if ((isPercentageCoupon && isFixedCoupon) || (!isPercentageCoupon && !isFixedCoupon)) {
        return next(new AppError("please specify coupon is percentage or fixed ...", 409))

    }

    // assign to users .....
    // 1- at first i need to get all usersIds who coupon owner want to make them to use this coupon 
    // 2- so i should get all usersIds from couponAssignedToUser
    // 3- then i should check if all usersIds from couponAssignedToUser is really exist or not by using $in operator
    // 4- note that $in operator dose not fail if it dont includes any one of usersIds so i should compare by length 

    let usersIds = []
    // couponAssignedToUser => it is array of objects 

    for (const user of couponAssignedToUser) {

        usersIds.push(user.userId)
    }

    const userCheck = await userModel.find({ _id: { $in: usersIds } })

    if (usersIds.length != userCheck.length) {
        return next(new AppError("invalid users ids...", 409))

    }


    // assign to products ....
    // const products = await productModel
    //   .find({ price: { $gte: 40000 } })
    //   .select('_id')
    // const couponAssginedToProduct = products

    const couponObject = {

        couponCode,
        couponAmount,
        isPercentageCoupon,
        isFixedCoupon,
        fromDate,
        TODate,
        createdBy: _id,
        couponAssignedToUser,
        // couponAssginedToProduct

    }

    const coupon = await couponModel.create(couponObject)
    if (!coupon) {
        return next(new AppError("fail to add coupon...", 409))

    }
    return res.status(201).json({ message: 'success', coupon })

}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// 2- update coupon ...

export const updateCoupon = async (req, res, next) => {
    const { _id } = req.authUser
    const { couponId } = req.query
    const { couponCode, couponAmount, isPercentageCoupon, isFixedCoupon, couponAssignedToUser, fromDate, TODate } = req.body

    const couponChecked = await couponModel.findOne({ _id: couponId, createdBy: _id, couponStatus:"valid" })
    if (!couponChecked) {
        return next(new AppError("your coupon is not exist or not authorized or expired ...", 409))
    }


    if (couponCode) {

        // check if old name is equal new name or not
        if (couponChecked.couponCode == couponCode) {
            return next(new AppError("your couponCode is similar to old name  ...", 409))
        }

        // check that this name is unique
        const couponCheckedName = await couponModel.findOne({ couponCode })
        if (couponCheckedName) {
            return next(new AppError("your couponCode name is similar to another couponCode ...", 409))
        }


        couponChecked.couponCode = couponCode;
    }

    if (couponAmount) {
        couponChecked.couponAmount = couponAmount
    }

    if (isPercentageCoupon) {
        couponChecked.isPercentageCoupon = isPercentageCoupon
    }

    if (isFixedCoupon) {
        couponChecked.isFixedCoupon = isFixedCoupon
    }

    if (couponAssignedToUser) {

        let usersIds = []
        // couponAssignedToUser => it is array of objects 

        for (const user of couponAssignedToUser) {

            usersIds.push(user.userId)
        }

        const userCheck = await userModel.find({ _id: { $in: usersIds } })

        if (usersIds.length != userCheck.length) {
            return next(new AppError("invalid users ids...", 409))

        }

        couponChecked.couponAssignedToUser = couponAssignedToUser

    }

    if(fromDate){
        couponChecked.fromDate = fromDate
  
    }

    if(TODate){
        couponChecked.TODate = TODate
  
    }
    couponChecked.updatedBy= _id
    await couponChecked.save()

    return res.status(201).json({ message: 'success', couponChecked })

}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// 3- delete coupon ...

export const deleteCoupon = async (req, res, next) => {
    const { _id } = req.authUser
    const { coupon_id } = req.query

    const couponChecked = await couponModel.findOneAndDelete({ _id: coupon_id, createdBy: _id })
    if (!couponChecked) {
        return next(new AppError("your coupon is not exist or not othorized ...", 409))
    }

    return res.status(201).json({ message: 'success', couponChecked })

}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// 4- get all coupons...

export const getAllCoupons = async (req, res, next) => {

    const getAllCoupons = await couponModel.find()

    return res.status(200).json({ message: 'success', getAllCoupons })

}