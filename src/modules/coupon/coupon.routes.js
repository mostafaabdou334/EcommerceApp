
import { Router } from "express";

import * as couponController from './coupon.controller.js'
import { errorHandler } from "../../utilities/errorHandling.js";
import { validationCoreFunction } from "../../middleware/validation.js";
import { addCouponSchema, deleteCouponSchema, updateCouponSchema } from "./coupon.validationSchema.js";
import { isAuth } from "../../middleware/auth.js";
import { couponRoles } from "./coupon.roles.js";




const router = Router()

router.post('/addCoupon',isAuth(couponRoles.addCoupon),validationCoreFunction(addCouponSchema),errorHandler(couponController.addCoupon))
router.put('/updateCoupon',isAuth(couponRoles.updateCoupon),validationCoreFunction(updateCouponSchema),errorHandler(couponController.updateCoupon))
router.delete('/deleteCoupon',isAuth(couponRoles.deleteCoupon),validationCoreFunction(deleteCouponSchema),errorHandler(couponController.deleteCoupon))
router.get('/getAllCoupons',errorHandler(couponController.getAllCoupons))



export default router