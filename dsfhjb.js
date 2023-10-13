// ====================================================>   create order cash from cart products ...    <=====================================================



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
        // const orderCode = `${req.authUser.userName}_${nanoid(3)}`
        // // generat invoice object
        // const orderinvoice = {
        //   shipping: {
        //     name: req.authUser.userName,
        //     address: orderDB.address,
        //     city: 'Alex',
        //     state: 'Alex',
        //     country: 'Egypt',
        //   },
        //   orderCode,
        //   date: orderDB.createdAt,
        //   items: orderDB.products,
        //   subTotal: orderDB.subTotal,
        //   paidAmount: orderDB.paidAmount,
        // }
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
        return res.status(201).json({ message: 'Done', orderDB, checkOutUrl: orderSession?.url })
    }

    // if there is order created
    return next(new Error('fail to create your order', { cause: 400 }))
}

// ====================================================>   create order card from cart products ...    <=====================================================

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
            customer_email: req.authUser.email,
            metadata: { orderId: orderDB._id.toString() },
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