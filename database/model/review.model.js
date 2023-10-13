import mongoose, { Schema } from "mongoose";

const reviewSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'user',
      required: true,
    },
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'product',
      required: true,
    },
    reviewRate: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
      enum: [1, 2, 3, 4, 5],
    },
    reviewComment: String ,
  },
  {
    timestamps: true,
  },
)

export const reviewModel = mongoose.model('Review', reviewSchema)
