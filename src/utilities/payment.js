import Stripe from "stripe";

export const paymentFunction = async ({
    payment_method_types = ['card'],
    mode = 'payment',
    customer_email = '',
    metadata = {},
    success_url,
    cancel_url,
    discounts = [],
    line_items = [],
}) => {

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY) // to estaplish connection
    const paymentData = await stripe.checkout.sessions.create({
        payment_method_types, // required
        mode, // required
        customer_email, // optional
        metadata,  // optional , to store information about our order ( order id)
        success_url, // required => as if stripe accept this card , it will navigate to this success_url , so it required
        cancel_url, // required => as if stripe refused this card , it will navigate to this cancel_url  , so it required
        discounts, // array to add in it (coupon) if i have coupon
        line_items, // required , information about my order in details 

    })

    return paymentData

}


// this form => stripe need it 

// [
//     {
//         price_data: {
//             currency,
//             product_data: {
//                 name
//             },
//             unit_amount
//         },
//         quantity
//     }
// ]