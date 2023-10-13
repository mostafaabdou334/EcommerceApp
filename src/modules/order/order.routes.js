import { Router } from "express";
import { errorHandler } from "../../utilities/errorHandling.js";
import * as orderController from './order.controller.js'
import { isAuth } from "../../middleware/auth.js";
import { orderRoles } from "./order.roles.js";
import { validationCoreFunction } from "../../middleware/validation.js";
import { cancelOrderSchema, fromCartOrderSchema } from "./order.validationSchema.js";
import express from 'express';




const router = Router()

router.post('/fromCartOrderCash', isAuth(orderRoles.createOrder), validationCoreFunction(fromCartOrderSchema), errorHandler(orderController.fromCartOrderCash))
router.post('/fromCartOrderCard', isAuth(orderRoles.createOrder), validationCoreFunction(fromCartOrderSchema), errorHandler(orderController.fromCartOrderCard))
router.post('/webhook', express.raw({ type: 'application/json' }), errorHandler(orderController.webhook))

router.patch('/cancelOrder', isAuth(orderRoles.createOrder), validationCoreFunction(cancelOrderSchema), errorHandler(orderController.cancelOrder))

// router.get('/successOrder' ,errorHandler(orderController.successPayment))  
router.get('/cancelOrderr', errorHandler(orderController.cancelPayment))

// router.post('/createOrder',isAuth(orderRoles.createOrder) ,errorHandler(orderController.createOrder)) 
router.patch('/deliverOrder', isAuth(orderRoles.createOrder), errorHandler(orderController.deliverOrder))









export default router