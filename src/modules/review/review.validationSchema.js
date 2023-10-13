import joi from 'joi'

export const createReviewSchema = {

    body: joi.object({
        reviewComment:joi.string().optional(),
        reviewRate:joi.number().min(1).max(5).required()

    }).required(),
    query: joi.object({
        productId: joi.string().hex().length(24).required(),
    }).required()
}



