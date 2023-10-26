import { orderModel } from "../../../database/model/order.model.js";
import { productModel } from "../../../database/model/product.model.js";
import { reviewModel } from "../../../database/model/review.model.js";
import { AppError } from "../../utilities/AppError.js";




export const createReview = async (req, res, next) => {

    const { _id } = req.authUser
    const { reviewRate, reviewComment } = req.body;
    const { productId } = req.query

    // ================================= check  product is valid to be reviewed by this user or not ===================

    const isProductValidToBeReviewed = await orderModel.findOne({
        userId: _id,
        'products.productId': productId,
        orderStatus: 'delivered',
    })
    if (!isProductValidToBeReviewed) {
        return next(new AppError('you should buy the product first', 400))
    }

    const reviewObject = {
        userId : _id,
        productId,
        reviewComment,
        reviewRate,
      }
      const reviewDB = await reviewModel.create(reviewObject)
      req.failedDocument = { model: reviewModel, _id: reviewDB._id }

      if (!reviewDB) {
        return next(new Error('fail to add review', { cause: 500 }))
      }

      const product = await productModel.findById(productId)
      const reviews = await reviewModel.find({ productId })
      let sumOfRates = 0
      for (const review of reviews) {
        sumOfRates += review.reviewRate
      }
      product.rate = Number(sumOfRates / reviews.length).toFixed(2)
      await product.save()

      res.status(201).json({ message: 'Done', reviewDB })

}