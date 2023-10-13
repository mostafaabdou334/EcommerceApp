import { scheduleJob } from 'node-schedule'
import { userModel } from '../../database/model/user.model.js'
import { couponModel } from '../../database/model/coupon.model.js'
import moment from 'moment'

// ========================================> first way to use node-schedule ...(best way)  <==================================

// we should call every cron in index ...

// *    *    *    *    *    *
// ┬    ┬    ┬    ┬    ┬    ┬
// │    │    │    │    │    │
// │    │    │    │    │    └ day of week (0 - 7) (0 or 7 is Sun)
// │    │    │    │    └───── month (1 - 12)
// │    │    │    └────────── day of month (1 - 31)
// │    │    └─────────────── hour (0 - 23)
// │    └──────────────────── minute (0 - 59)
// └───────────────────────── second (0 - 59, OPTIONAL)

export const cronOne = () => {
    scheduleJob('*/5 * * * * *', function () {

        // here i write what i need to do ..
        console.log("cronOne every second  ....")
        // what we can do ...?
        // check on dataBase 
        // delete every user who isConfirmed is false 
    })
}


// '* * * * * *'  => every second 
// '*/5 * * * * *'  => every 5 second 
// '* 5 * * * *'   => every second in ( minute number 5 only ) in every hour in every day in every month ...so it will run 60 times only
// '* * 22 * * *'  => every second in every minute ( when clock is 2 pm )in every day in every month
// '* * * 15 * *'  => every second in every minute in every hour when( day is 15 in month)in every month
// '* * * * 1 *'  => every second in every minute in every hour in every day when(month is january)
// '* * * * * 1'  => every second in every minute in every hour in (every saturday in week) in every month



// cron jop to delete unconfirmed users from database ....

export const cronDeleteUnconfirmedUsers = () => {
    scheduleJob('*/20 * * * * *', async function () {

        const unconfirmedUsers = await userModel.deleteMany({ isConfirmed: false })
    })
}



// cron jop to change invalid coupons status in coupon model from database ....

export const cronChangeInvalidCoupons = () => {
    scheduleJob('*/2 * * * * *', async function () {

        // const invalidCoupons = await couponModel.updateMany({TODate:{$lt:Date.now()}},{couponStatus:"expired"})
        // console.log("nsdsbdh")
         const validCoupons = await couponModel.find({couponStatus:"valid"})
        //  console.log(validCoupons)
        for (const coupon of validCoupons) {

            if(moment(coupon.TODate).isBefore(moment())){

                coupon.couponStatus = "expired"
            }
            await coupon.save()
            
        }


    })
}

// ========================================> second way to use node-schedule ...  <==================================


// not work

export const cronTwo = () => {
    scheduleJob({ hour: 22, minute: 49, dayOfWeek: 4 }, function () {

        // here i write what i need to do ..
        console.log("cronTwo at hour:22 , minute:45 , dayOfWeek:4  ....")
    })
}


// there is also another method ... but not best



/////////////////////////////////////////////////////////////////////////////////////////////////////

// gracefulShutdown()  =>  if i need to stop all (above crons)  so we should write it in index file only


// cronOne()
// cronTwo()
// gracefulShutdown()  // if i need to stop all (above crons)

//cronOne()
// gracefulShutdown()  // if i need to stop all (above crons) => so here i stop cron one only
// cronTwo()
