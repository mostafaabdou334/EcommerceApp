
import { Router } from "express";

import { errorHandler } from "../../utilities/errorHandling.js";
import { validationCoreFunction } from "../../middleware/validation.js";
import { isAuth } from "../../middleware/auth.js";
import { reviewRoles } from "./review.roles.js";
import * as reviewControllers from './review.controller.js'
import { createReviewSchema } from "./review.validationSchema.js";




const router = Router()

router.post("/createReview",isAuth(reviewRoles.createReview),validationCoreFunction(createReviewSchema),errorHandler(reviewControllers.createReview))


export default router