import moment from 'moment'
import { couponModel } from '../../database/model/coupon.model.js'
import { AppError } from './AppError.js'

export const isCouponValid = async ({ couponCode, _id, next } = {}) => {

  const coupon = await couponModel.findOne({ couponCode })

  // check if coupon is exist or not ...
  if (!coupon) {
    return next(new AppError('please enter a valid coupon code', 400))
  }

  // check if coupon is expired or not
  if (coupon.couponStatus == 'expired' || moment(coupon.TODate).isBefore(moment())) {
    return next(new AppError('coupon is expired', 400))
  }


    // check if coupon is start or not
    if (coupon.couponStatus == 'valid' && moment(coupon.fromDate).isAfter(moment())) {
      return next(new AppError('coupon does not start', 400))
    }

  // // coupon not assgined to user

  let checkArray = []
  let index = 0
  for (const checkUser of coupon.couponAssignedToUser) {
    if (checkUser.userId.toString() === _id.toString()) {
      checkArray.push(_id)
      if (checkUser.maxUsage <= checkUser.usageCount) {
        return next(new AppError('exceed the max usage for this coupon', 400))
      }
    }

  }

  if (!checkArray.length) {
    return next(new AppError('this user not assgined for this coupon', 400))

  }

  return true  // if all good . i need this function to return true
}
