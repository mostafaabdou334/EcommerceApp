import { nanoid } from "nanoid"
import { cartModel } from "../../../database/model/cart.model.js"
import { couponModel } from "../../../database/model/coupon.model.js"
import { orderModel } from "../../../database/model/order.model.js"
import { productModel } from "../../../database/model/product.model.js"
import { sendEmailService } from "../../services/sendEmailService.js"
import { AppError } from "../../utilities/AppError.js"
import { isCouponValid } from "../../utilities/couponValidation.js"
import createInvoice from "../../utilities/pdfkit.js"
import { generateQrCode } from "../../utilities/qrCodeFunction.js"
import { paymentFunction } from "../../utilities/payment.js"
import { generateToken, verifyToken } from "../../utilities/tokenFunctions.js"
import Stripe from "stripe"
import cloudinary from "../../utilities/cloudinary.config.js"


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// ====================================================>   create order for one product only ... <=====================================================

export const createOrder = async (req, res, next) => {

  const { _id } = req.authUser
  const { productId, quantity, paymentMethod, couponCode, address, phoneNumbers } = req.body


  // ======================== coupon check ================
  if (couponCode) {

    const coupon = await couponModel.findOne({ couponCode }) // i need this in next code below ....

    const isCouponValidResult = await isCouponValid({ couponCode, _id, next })

    if (isCouponValidResult !== true) {
      return isCouponValidResult
      // as i need to return what this function returned to know the problem .
    }

    req.coupon = coupon  // i need this in next code below ....
  }

  // so lets make calculations.....

  // ====================== products check ================

  const products = []
  const isProductValid = await productModel.findOne({ _id: productId, stock: { $gte: quantity } })

  if (!isProductValid) {
    return next(new AppError('invalid product or please check your quantity', 400))
  }
  const productObject = {
    productId,
    quantity,
    title: isProductValid.name,
    price: isProductValid.priceAfterDiscount,   // after discount
    finalPrice: isProductValid.priceAfterDiscount * quantity,  // after discount
  }
  products.push(productObject)

  //===================== subTotal ======================

  const subTotal = productObject.finalPrice  // as i have only one product .

  //====================== paid Amount after applied coupon =================

  let paidAmount = 0
  if (req.coupon?.isFixedCoupon && req.coupon?.couponAmount > isProductValid.priceAfterDiscount) {
    return next(new AppError('your coupon amount is greater than your priceAfterDiscount ', 400))
  }
  if (req.coupon?.isPercentageCoupon) {
    paidAmount = subTotal * (1 - (req.coupon.couponAmount || 0) / 100)
  } else if (req.coupon?.isFixedCoupon) {
    paidAmount = subTotal - req.coupon.couponAmount
  } else {
    paidAmount = subTotal
  }

  //======================= paymentMethod  + orderStatus ==================
  let orderStatus
  paymentMethod == 'cash' ? (orderStatus = 'placed') : (orderStatus = 'pending')

  const orderObject = {
    userId: _id,
    products,
    address,
    phoneNumbers,
    orderStatus,
    paymentMethod,
    subTotal,
    paidAmount,
    couponId: req.coupon?._id,
  }
  const orderDB = await orderModel.create(orderObject)
  if (orderDB) {
    // increase usageCount for coupon usage
    if (req.coupon) {
      for (const user of req.coupon.couponAssignedToUser) {
        if (user.userId.toString() == _id.toString()) {
          user.usageCount += 1
        }
      }
      await req.coupon.save()
    }

    // decrease product's stock by order's product quantity
    await productModel.findOneAndUpdate(
      { _id: productId },
      {
        $inc: { stock: -parseInt(quantity) },
      },
    )

    //TODO: remove product from userCart if exist

    // send invoice ......
    const orderCode = `${req.authUser.userName}_${nanoid(3)}`
    // generat invoice object
    const orderinvoice = {
      shipping: {
        name: req.authUser.userName,
        address: orderDB.address,
        city: 'Cairo',
        state: 'Cairo',
        country: 'Cairo',
      },
      orderCode,
      date: orderDB.createdAt,
      items: orderDB.products,
      subTotal: orderDB.subTotal,
      paidAmount: orderDB.paidAmount,
    }
    // fs.unlink()
    await createInvoice(orderinvoice, `${orderCode}.pdf`)
    await sendEmailService({
      to: req.authUser.email,
      subject: 'Order Confirmation',
      message: '<h1> please find your invoice pdf below</h1>',
      attachments: [
        {
          path: `./Files/${orderCode}.pdf`,
        },
      ],
    })

    const qrCode = await generateQrCode({ data: { orderID: orderDB._id, products: orderDB.products } })

    return res.status(201).json({ message: 'Done', orderDB, qrCode })
  }

  return next(new AppError('fail to create your order', 400))

}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// ====================================================>   create order from cart products cash ...    <=====================================================



// export const fromCartOrder = async (req, res, next) => {


//   // get data to make order ...
//   const { _id } = req.authUser
//   const { cartId } = req.query
//   const { address, phoneNumbers, paymentMethod, couponCode } = req.body

//   // check if there is cart or not ...
//   const cart = await cartModel.findById(cartId)
//   if (!cart || !cart.products.length) {
//     return next(new AppError('please fill your cart first', 400))
//   }

//   // i need to check if this product is already exist or not ....
//   let orderProduct = []
//   for (const product of cart.products) {

//     const productExist = await productModel.findById(product.productId)

//     // check if product is exist or not
//     if (productExist) {

//       // check if stock of this product is enough to cover this quantity or not ....
//       if (productExist.stock > product.quantity) {
//         orderProduct.push({
//           productId: product.productId, // from cart
//           quantity: product.quantity,   // from cart
//           title: productExist.name,   // from product
//           price: productExist.priceAfterDiscount,  // from product
//           finalPrice: productExist.priceAfterDiscount * product.quantity,
//         })
//       }

//       else {
//         return next(new AppError(`your product: ${productExist.name} its quantity is more than stock as found about only : ${productExist.stock}`, 400))
//       }

//     }

//     else {
//       return next(new AppError(`your product: ${product.productId} , is not found`, 400))
//     }

//   }

//   let subTotal = cart.subTotal

//   // coupon check and its validation ...
//   if (couponCode) {
//     const coupon = await couponModel.findOne({ couponCode })
//     const isCouponValidResult = await isCouponValid({ couponCode, _id, next })
//     if (isCouponValidResult !== true) {
//       return isCouponValidResult
//     }
//     req.coupon = coupon
//   }


//   // paid Amount ...
//   let paidAmount = 0
//   if (req.coupon?.isFixedCoupon && req.coupon?.couponAmount > subTotal) {
//     return next(new AppError('your coupon amount is more than your total price', 400))
//   }

//   if (req.coupon?.isPercentageCoupon) {
//     paidAmount = subTotal * (1 - (req.coupon.couponAmount || 0) / 100)
//   } else if (req.coupon?.isFixedCoupon) {
//     paidAmount = subTotal - req.coupon.couponAmount
//   } else {
//     // its mean that there is no coupon
//     paidAmount = subTotal
//   }

//   // paymentMethod and orderStatus ......
//   let orderStatus
//   paymentMethod == 'cash' ? (orderStatus = 'placed') : (orderStatus = 'pending')


//   // make order object to create order ....
//   const orderObject = {
//     userId: _id,
//     products: orderProduct,
//     address,
//     phoneNumbers,
//     orderStatus,
//     paymentMethod,
//     subTotal,
//     paidAmount,
//     couponId: req.coupon?._id,
//   }

//   // create order ....
//   const orderDB = await orderModel.create(orderObject)

//   if (orderDB) {


//     // after creating order i need to pay .... so i should to know how to pay ( cash or card )

//     /////////////////////////////////////////////////////////

//     // 1- if i will pay by card ....
//     let orderSession
//     if (orderDB.paymentMethod == 'card') {

//       // all below information needed to stripe...

//       const token = generateToken({ payLoad: { orderId: orderDB._id, user: req.authUser }, signature: process.env.ORDER_TOKEN, expiresIn: "1h" })

//       // ============== if there is coupon ============

//       if (req.coupon) {

//         // open connection to stripe ....
//         const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

//         let coupon
//         if (req.coupon.isPercentageCoupon) {
//           coupon = await stripe.coupons.create({
//             percent_off: req.coupon.couponAmount,
//           })
//         }

//         if (req.coupon.isFixedCoupon) {
//           coupon = await stripe.coupons.create({
//             amount_off: req.coupon.couponAmount * 100,
//             currency: 'EGP',
//           })
//         }

//         req.couponId = coupon.id   // coupon is from stripe

//       }

//       // ============ make order session ===========

//       orderSession = await paymentFunction({
//         payment_method_types: ['card'],
//         mode: 'payment',
//         customer_email: req.authUser.email,
//         metadata: { orderId: orderDB._id.toString() },
//         success_url: `${req.protocol}://${req.headers.host}/orders/successOrder?token=${token}`,
//         cancel_url: `${req.protocol}://${req.headers.host}/orders/cancelOrderr?token=${token}`,
//         line_items: orderDB.products.map((product) => {
//           return {
//             price_data: {
//               currency: 'EGP',
//               product_data: {
//                 name: product.title,
//               },
//               unit_amount: product.price * 100,
//             },
//             quantity: product.quantity,
//           }
//         }),

//         discounts: req.couponId ? [{ coupon: req.couponId }] : [],

//       })

//       return res.status(201).json({ message: 'Done', checkOutUrl: orderSession.url })

//       // console.log(`${req.protocol}://${req.headers.host}/orders/successOrder?token=${token}`)
//     }
//     ////////////////////////////////////////

//     // 2- if i will not pay by card so i will pay cash so i will do below  ....

//     // 2-1 increase usageCount for coupon usage
//     if (req.coupon) {
//       for (const user of req.coupon.couponAssignedToUser) {
//         if (user.userId.toString() == _id.toString()) {
//           user.usageCount += 1
//         }
//       }
//       await req.coupon.save()
//     }


//     // 2-2 decrease product's stock by order's product quantity in product model
//     for (const product of cart.products) {
//       await productModel.findOneAndUpdate(
//         { _id: product.productId },
//         {
//           $inc: {
//             stock: -parseInt(product.quantity),
//             soldItems: parseInt(product.quantity)
//           },
//         },
//       )
//     }

//     // 2-3 we should clear cart it self ...

//     cart.products = []
//     cart.subTotal = 0
//     await cart.save()

//     // or we should delete cart it self...eng nour said that
//     // const userCart = await cartModel.findOneAndDelete({ createdBy: _id, _id: cartId })


//     // 2-4 send invoice to make pdf file  ......
//     // const orderCode = `${req.authUser.userName}_${nanoid(3)}`
//     // // generat invoice object
//     // const orderinvoice = {
//     //   shipping: {
//     //     name: req.authUser.userName,
//     //     address: orderDB.address,
//     //     city: 'Alex',
//     //     state: 'Alex',
//     //     country: 'Egypt',
//     //   },
//     //   orderCode,
//     //   date: orderDB.createdAt,
//     //   items: orderDB.products,
//     //   subTotal: orderDB.subTotal,
//     //   paidAmount: orderDB.paidAmount,
//     // }
//     // fs.unlink()
//     // await createInvoice(orderinvoice, `${orderCode}.pdf`)


//     // 2-5 upload pdf file to cloudinary .(new)
//     // const { public_id, secure_url } = await cloudinary.uploader.upload(`./Files/${orderCode}.pdf`, {
//     //   folder: `E-commerce/users/${req.authUser.customId}/orders`,
//     // })

//     // orderDB.invoice = { public_id, secure_url }
//     await orderDB.save()

//     // 2-6 send this pdf to email .
//     await sendEmailService({
//       to: req.authUser.email,
//       subject: 'Order Confirmation',
//       message: '<h1> please find your invoice pdf below</h1>',
//       attachments: [
//         {
//           path: `./Files/${orderCode}.pdf`,
//         },
//       ],
//     })


//     // 2-7 make QR code by this order...
//     // const qrCode = await generateQrCode({ data: { orderID: orderDB._id, products: orderDB.products } })


//     // last make response by this order ...
//     return res.status(201).json({ message: 'Done', orderDB, checkOutUrl: orderSession?.url })
//   }

//   // if there is order created
//   return next(new Error('fail to create your order', { cause: 400 }))
// }

export const fromCartOrderCash = async (req, res, next) => {


  // get data to make order ...
  const { _id } = req.authUser
  const { cartId } = req.query
  const { address, phoneNumbers, paymentMethod, couponCode } = req.body

  // check if there is cart or not ...
  const cart = await cartModel.findById(cartId)
  if (!cart || !cart.products.length) {
    return next(new AppError('please fill your cart first', 400))
  }

  // i need to check if this product is already exist or not ....
  let orderProduct = []
  for (const product of cart.products) {

    const productExist = await productModel.findById(product.productId)

    // check if product is exist or not
    if (productExist) {

      // check if stock of this product is enough to cover this quantity or not ....
      if (productExist.stock > product.quantity) {
        orderProduct.push({
          productId: product.productId, // from cart
          quantity: product.quantity,   // from cart
          title: productExist.name,   // from product
          price: productExist.priceAfterDiscount,  // from product
          finalPrice: productExist.priceAfterDiscount * product.quantity,
        })
      }

      else {
        return next(new AppError(`your product: ${productExist.name} its quantity is more than stock as found about only : ${productExist.stock}`, 400))
      }

    }

    else {
      return next(new AppError(`your product: ${product.productId} , is not found`, 400))
    }

  }

  let subTotal = cart.subTotal

  // coupon check and its validation ...
  if (couponCode) {
    const coupon = await couponModel.findOne({ couponCode })
    const isCouponValidResult = await isCouponValid({ couponCode, _id, next })
    if (isCouponValidResult !== true) {
      return isCouponValidResult
    }
    req.coupon = coupon
  }


  // paid Amount ...
  let paidAmount = 0
  if (req.coupon?.isFixedCoupon && req.coupon?.couponAmount > subTotal) {
    return next(new AppError('your coupon amount is more than your total price', 400))
  }

  if (req.coupon?.isPercentageCoupon) {
    paidAmount = subTotal * (1 - (req.coupon.couponAmount || 0) / 100)
  } else if (req.coupon?.isFixedCoupon) {
    paidAmount = subTotal - req.coupon.couponAmount
  } else {
    // its mean that there is no coupon
    paidAmount = subTotal
  }

  // paymentMethod and orderStatus ......
  let orderStatus
  paymentMethod == 'cash' ? (orderStatus = 'placed') : (orderStatus = 'pending')


  // make order object to create order ....
  const orderObject = {
    userId: _id,
    products: orderProduct,
    address,
    phoneNumbers,
    orderStatus,
    paymentMethod,
    subTotal,
    paidAmount,
    couponId: req.coupon?._id,
  }

  // create order ....
  const orderDB = await orderModel.create(orderObject)

  if (orderDB) {


    // 2- if i will not pay by card so i will pay cash so i will do below  ....

    // 2-1 increase usageCount for coupon usage
    if (req.coupon) {
      for (const user of req.coupon.couponAssignedToUser) {
        if (user.userId.toString() == _id.toString()) {
          user.usageCount += 1
        }
      }
      await req.coupon.save()
    }


    // 2-2 decrease product's stock by order's product quantity in product model
    for (const product of cart.products) {
      await productModel.findOneAndUpdate(
        { _id: product.productId },
        {
          $inc: {
            stock: -parseInt(product.quantity),
            soldItems: parseInt(product.quantity)
          },
        },
      )
    }

    // 2-3 we should clear cart it self ...

    cart.products = []
    cart.subTotal = 0
    await cart.save()

    // or we should delete cart it self...eng nour said that
    // const userCart = await cartModel.findOneAndDelete({ createdBy: _id, _id: cartId })


    // 2-4 send invoice to make pdf file  ......
    const orderCode = `${req.authUser.userName}_${nanoid(3)}`
    // // generat invoice object
    const orderinvoice = {
      shipping: {
        name: req.authUser.userName,
        address: orderDB.address,
        city: 'Alex',
        state: 'Alex',
        country: 'Egypt',
      },
      orderCode,
      date: orderDB.createdAt,
      items: orderDB.products,
      subTotal: orderDB.subTotal,
      paidAmount: orderDB.paidAmount,
    }
    // fs.unlink()
    // await createInvoice(orderinvoice, `${orderCode}.pdf`)


    // 2-5 upload pdf file to cloudinary .(new)
    // const { public_id, secure_url } = await cloudinary.uploader.upload(`./Files/${orderCode}.pdf`, {
    //   folder: `E-commerce/users/${req.authUser.customId}/orders`,
    // })

    // orderDB.invoice = { public_id, secure_url }
    await orderDB.save()

    // 2-6 send this pdf to email .
    // await sendEmailService({
    //     to: req.authUser.email,
    //     subject: 'Order Confirmation',
    //     message: '<h1> please find your invoice pdf below</h1>',
    //     attachments: [
    //         {
    //             path: `./Files/${orderCode}.pdf`,
    //         },
    //     ],
    // })


    // 2-7 make QR code by this order...
    // const qrCode = await generateQrCode({ data: { orderID: orderDB._id, products: orderDB.products } })


    // last make response by this order ...
    return res.status(201).json({ message: 'Done', orderDB, })
  }

  // if there is order created
  return next(new Error('fail to create your order', { cause: 400 }))
}

// ====================================================>   create order from cart products card ...    <=====================================================

export const fromCartOrderCard = async (req, res, next) => {


  // get data to make order ...
  const { _id } = req.authUser
  const { cartId } = req.query
  const { address, phoneNumbers, paymentMethod, couponCode } = req.body

  // check if there is cart or not ...
  const cart = await cartModel.findById(cartId)
  if (!cart || !cart.products.length) {
    return next(new AppError('please fill your cart first', 400))
  }

  // i need to check if this product is already exist or not ....
  let orderProduct = []
  for (const product of cart.products) {

    const productExist = await productModel.findById(product.productId)

    // check if product is exist or not
    if (productExist) {

      // check if stock of this product is enough to cover this quantity or not ....
      if (productExist.stock > product.quantity) {
        orderProduct.push({
          productId: product.productId, // from cart
          quantity: product.quantity,   // from cart
          title: productExist.name,   // from product
          price: productExist.priceAfterDiscount,  // from product
          finalPrice: productExist.priceAfterDiscount * product.quantity,
        })
      }

      else {
        return next(new AppError(`your product: ${productExist.name} its quantity is more than stock as found about only : ${productExist.stock}`, 400))
      }

    }

    else {
      return next(new AppError(`your product: ${product.productId} , is not found`, 400))
    }

  }

  let subTotal = cart.subTotal

  // coupon check and its validation ...
  if (couponCode) {
    const coupon = await couponModel.findOne({ couponCode })
    const isCouponValidResult = await isCouponValid({ couponCode, _id, next })
    if (isCouponValidResult !== true) {
      return isCouponValidResult
    }
    req.coupon = coupon
  }


  // paid Amount ...
  let paidAmount = 0
  if (req.coupon?.isFixedCoupon && req.coupon?.couponAmount > subTotal) {
    return next(new AppError('your coupon amount is more than your total price', 400))
  }

  if (req.coupon?.isPercentageCoupon) {
    paidAmount = subTotal * (1 - (req.coupon.couponAmount || 0) / 100)
  } else if (req.coupon?.isFixedCoupon) {
    paidAmount = subTotal - req.coupon.couponAmount
  } else {
    // its mean that there is no coupon
    paidAmount = subTotal
  }

  // make order object to create order ....
  const orderObject = {
    userId: _id,
    products: orderProduct,
    address,
    phoneNumbers,
    orderStatus:"pending",
    paymentMethod,
    subTotal,
    paidAmount,
    couponId: req.coupon?._id,
  }

  // create order ....
  const orderDB = await orderModel.create(orderObject)

  if (orderDB) {

    // 1- if i will pay by card ....
    let orderSession


    // all below information needed to stripe...

    const token = generateToken({ payLoad: { orderId: orderDB._id, user: req.authUser }, signature: process.env.ORDER_TOKEN, expiresIn: "1h" })

    // ============== if there is coupon ============

    if (req.coupon) {

      // open connection to stripe ....
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

      let coupon
      if (req.coupon.isPercentageCoupon) {
        coupon = await stripe.coupons.create({
          percent_off: req.coupon.couponAmount,
        })
      }

      if (req.coupon.isFixedCoupon) {
        coupon = await stripe.coupons.create({
          amount_off: req.coupon.couponAmount * 100,
          currency: 'EGP',
        })
      }

      req.couponId = coupon.id   // coupon is from stripe

    }

    // ============ make order session ===========

    orderSession = await paymentFunction({
      payment_method_types: ['card'],
      mode: 'payment',
      metadata: { order_id: orderDB._id },
      customer_email: req.authUser.email,
      success_url: `${req.protocol}://${req.headers.host}/orders/successOrder?token=${token}`,
      cancel_url: `${req.protocol}://${req.headers.host}/orders/cancelOrderr?token=${token}`,
      line_items: orderDB.products.map((product) => {
        return {
          price_data: {
            currency: 'EGP',
            product_data: {
              name: product.title,
            },
            unit_amount: product.price * 100,
          },
          quantity: product.quantity,
        }
      }),

      discounts: req.couponId ? [{ coupon: req.couponId }] : [],

    })

    return res.status(201).json({ message: 'Done', checkOutUrl: orderSession.url })


  }

  // if there is fail to order created
  return next(new Error('fail to create your order', { cause: 400 }))
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// webHook...

export const webhook = async (request,response) => {

  const endpointSecret = process.env.STRIP_ENDPOIT_SECRET;
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY) // to estaplish connection

  const sig = request.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(request.body, sig, endpointSecret);
  } catch (err) {
    response.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  const orderId = event.data.object.metadata.order_id
  console.log(orderId)
  const order = await orderModel.findById(orderId)
  // Handle the event
  if (event.type === "checkout.session.completed"||event.type ==="checkout.session.async_payment_succeeded") {

    const orderId = event.data.object.metadata.order_id
    const order = await orderModel.findById(orderId)


    order.orderStatus = 'confirmed';
    await order.save()


    // 2-1 increase usageCount for coupon usage
    // if (order.couponId) {
    //   const coupon = await couponModel.findById(order.couponId)
    //   for (const user of coupon.couponAssignedToUser) {
    //     if (user.userId.toString() == order.userId.toString()) {
    //       user.usageCount += 1
    //     }
    //   }
    //   await coupon.save()
    // }

    // 2-2 decrease product's stock by order's product quantity in product model
    // for (const product of order.products) {
    //   await productModel.findOneAndUpdate(
    //     { _id: product.productId },
    //     {
    //       $inc: {
    //         stock: -parseInt(product.quantity),
    //         soldItems: parseInt(product.quantity)
    //       },
    //     },
    //   )
    // }

    // 2-3 we should clear cart it self ...
    // const cart = await cartModel.findOneAndUpdate({ createdBy: order.userId }, { products: [], subTotal: 0 })

    // 2-4 send invoice to make pdf file  ......
    // const orderCode = `${decodeData.user.userName}_${nanoid(3)}`
    // generat invoice object
    // const orderinvoice = {
    //   shipping: {
    //     name: decodeData.user.userName,
    //     address: decodeData.user.address,
    //     city: 'Alex',
    //     state: 'Alex',
    //     country: 'Egypt',
    //   },
    //   orderCode,
    //   date: order.createdAt,
    //   items: order.products,
    //   subTotal: order.subTotal,
    //   paidAmount: order.paidAmount,
    // }
    // fs.unlink()
    // await createInvoice(orderinvoice, `${orderCode}.pdf`)

    //2-5 upload pdf file to cloudinary .(new)
    // const { public_id, secure_url } = await cloudinary.uploader.upload(`./Files/${orderCode}.pdf`, {
    //   folder: `E-commerce/users/${decodeData.user.customId}/orders`,
    // })

    // order.invoice = { public_id, secure_url }

    // 2-6 send this pdf to email .
    //  await sendEmailService({
    //   to: decodeData.user.email,
    //   subject: 'Order Confirmation',
    //   message: '<h1> please find your invoice pdf below</h1>',
    //   attachments: [
    //     {
    //       path: `./Files/${orderCode}.pdf`,
    //     },
    //   ],
    // })

    ////////////////
    await order.save()
    return;

  }

  // else {

  //   // if faild to pay ....
  //   order.orderStatus = 'refunded';
  //   await order.save()
  //   return res.status(200).json({ message: 'fail to pay', order })
  // }



}
// ============================= success payment at card  ===================
export const successPayment = async (req, res, next) => {
  const { token } = req.query
  const decodeData = verifyToken({ token, signature: process.env.ORDER_TOKEN })
  const order = await orderModel.findOne({
    _id: decodeData.orderId,
    orderStatus: 'pending',
  })
  if (!order) {
    return next(new AppError('invalid order id', 400))
  }

  order.orderStatus = 'confirmed'
  ////////////////
  // 2-1 increase usageCount for coupon usage
  if (order.couponId) {
    const coupon = await couponModel.findById(order.couponId)
    for (const user of coupon.couponAssignedToUser) {
      if (user.userId.toString() == order.userId.toString()) {
        user.usageCount += 1
      }
    }
    await coupon.save()
  }

  // 2-2 decrease product's stock by order's product quantity in product model
  for (const product of order.products) {
    await productModel.findOneAndUpdate(
      { _id: product.productId },
      {
        $inc: {
          stock: -parseInt(product.quantity),
          soldItems: parseInt(product.quantity)
        },
      },
    )
  }

  // 2-3 we should clear cart it self ...
  const cart = await cartModel.findOneAndUpdate({ createdBy: order.userId }, { products: [], subTotal: 0 })

  // 2-4 send invoice to make pdf file  ......
  const orderCode = `${decodeData.user.userName}_${nanoid(3)}`
  // generat invoice object
  // const orderinvoice = {
  //   shipping: {
  //     name: decodeData.user.userName,
  //     address: decodeData.user.address,
  //     city: 'Alex',
  //     state: 'Alex',
  //     country: 'Egypt',
  //   },
  //   orderCode,
  //   date: order.createdAt,
  //   items: order.products,
  //   subTotal: order.subTotal,
  //   paidAmount: order.paidAmount,
  // }
  // fs.unlink()
  // await createInvoice(orderinvoice, `${orderCode}.pdf`)

  //2-5 upload pdf file to cloudinary .(new)
  // const { public_id, secure_url } = await cloudinary.uploader.upload(`./Files/${orderCode}.pdf`, {
  //   folder: `E-commerce/users/${decodeData.user.customId}/orders`,
  // })

  // order.invoice = { public_id, secure_url }

  // 2-6 send this pdf to email .
  //  await sendEmailService({
  //   to: decodeData.user.email,
  //   subject: 'Order Confirmation',
  //   message: '<h1> please find your invoice pdf below</h1>',
  //   attachments: [
  //     {
  //       path: `./Files/${orderCode}.pdf`,
  //     },
  //   ],
  // })

  ////////////////
  await order.save()
  res.status(200).json({ message: 'done', order })
}

// ============================= cancel payment at card  ===================
export const cancelPayment = async (req, res, next) => {
  const { token } = req.query
  const decodeData = verifyToken({ token, signature: process.env.ORDER_TOKEN })
  const order = await orderModel.findOne({
    _id: decodeData.orderId
  })
  if (!order) {
    return next(new AppError('invalid order id', 400))
  }

  order.orderStatus = 'canceled'
  await order.save()

  res.status(200).json({ message: 'done', order })
}


// ============================= cancel payment at cash  ===================

export const cancelOrder = async (req, res, next) => {
  const { orderId } = req.query
  const order = await orderModel.findById(orderId)
  if (!order) {
    return next(new AppError('invalid order id', 400))
  }

  if (order.orderStatus === 'shipping' || order.orderStatus === 'delivered') {
    return next(new AppError('can not cancel order !', 400))
  }

  //=============== approch one orderSattus:'canceled'

  order.orderStatus = 'canceled'
  await order.save()

  // increase product quantity and decrease sold items
  for (const product of order.products) {
    await productModel.findByIdAndUpdate(product.productId, {
      $inc: {
        stock: parseInt(product.quantity), soldItems: -parseInt(product.quantity)
      },

    })
  }

  // decrease couponUsage...
  if (order.couponId) {
    const coupon = await couponModel.findById(order.couponId)

    coupon.couponAssignedToUser.map((ele) => {
      if (order.userId.toString() == ele.userId.toString()) {
        ele.usageCount -= 1
      }
    })

    await coupon.save()
  }

  //delete pdf from cloudinary ...
  if (order.invoice) {
    const resultData = await cloudinary.uploader.destroy(order.invoice.public_id)
    order.invoice = {}
    await order.save()
  }
  res.status(200).json({ message: 'order canceled successfully', order })

}

// ================================ mark teh order as delivered ===================
export const deliverOrder = async (req, res, next) => {
  const { orderId } = req.query

  const order = await orderModel.findOneAndUpdate(
    {
      _id: orderId,
      orderStatus: { $nin: ['delivered', 'pending', 'canceled', 'rejected'] },
    },
    {
      orderStatus: 'delivered',
    },
    {
      new: true,
    },
  )

  if (!order) {
    return next(new AppError('invalid order', 400))
  }

  return res.status(200).json({ message: 'Done', order })
}
