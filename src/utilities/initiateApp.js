import databaseConnection from "../../database/database.connection.js"
import { globalErrorMiddleware } from "../middleware/globalErrorMiddleware.js"
import * as allRouters from '../modules/index.routers.js'
import { AppError } from "./AppError.js"
import { cronChangeInvalidCoupons } from "./Crons.js"
import cors from 'cors'


export const initiateApp = (app, express) => {

    //============================================>  cors origin manual (some origins) <==========================================
    // cors origin ....

    // const whiteList = ["http://localhost:3000", undefined]; // here i can do all serves which can access my server of my database
    // //  undefined => for postman .
    // app.use((req, res, next) => {

    //     // 0- i need to allow this url  ...

    //     if (req.originalUrl.includes("/auth/confirmedEmail")) {

    //         res.setHeader("Access-Control-Allow-Origin", "*")
    //         res.setHeader("Access-Control-Allow-Methods", "GET")
    //         return next()
    //     }

    //     // 1- i need to make sure that url who want to access my server is from whiteList or not ...
    //     console.log(req.header('origin'))
    //     if (!whiteList.includes(req.header('origin'))) {

    //         // req.header('origin') => it about url which need to access my server .
    //         return next(new AppError('Blocked By Cors !', 400))
    //     }

    //     // 2- if url passed this up condition , i will allowed to it features ...below...

    //     // 2-1- i need to allow  the accepted urls to access my server ...
    //     res.setHeader("Access-Control-Allow-Origin", "*")

    //     // 2-2- i need to allow  the accepted urls to send any thing in header (like token) to my server ...
    //     res.setHeader("Access-Control-Allow-Headers", "*")

    //     // 2-3- i need to allow  the accepted urls to send any (request method) or (i can specify some methods only) as i like ...
    //     res.setHeader("Access-Control-Allow-Methods", "*")

    //     // 2-4- i need to allow  any private network like (postman or any localhost) to access my server (in this case my database is real server and frontend need to test my Apis ...) ...
    //     res.setHeader("Access-Control-Allow-Private-Network", true)
    //     // res.setHeader("Access-Control-Allow-Private-Network", true) => default is (false)

    //     return next()

    // })

    //============================================>  cors origin manual (all origins)  <==========================================

    // 1- by manual ....

// 1-1 if i need all origins to access my server ....

    
    app.use((req, res, next) => {

        // 1-1-1 i need to allow  the accepted urls to access my server ...
        res.setHeader("Access-Control-Allow-Origin", "*")

        // 1-1-2- i need to allow  the accepted urls to send any thing in header (like token) to my server ...
        res.setHeader("Access-Control-Allow-Headers", "*")

        // 1-1-3- i need to allow  the accepted urls to send any (request method) or (i can specify some methods only) as i like ...
        res.setHeader("Access-Control-Allow-Methods", "*")

        // 1-1-4- i need to allow  any private network like (postman or any localhost) to access my server (in this case my database is real server and frontend need to test my Apis ...) ...
        res.setHeader("Access-Control-Allow-Private-Network", true)
        // res.setHeader("Access-Control-Allow-Private-Network", true) => default is (false)

        return next()

    })
    //============================================>  cors origin by cors package  <==========================================

    // app.use(cors())
    ////////////////////////////////////////////////

    
    app.use(express.json())
    databaseConnection()

    app.use('/auth', allRouters.authRoutes)
    app.use('/users', allRouters.userRoutes)
    app.use('/categories', allRouters.categoryRouters)
    app.use('/subCategories', allRouters.subCategoryRouters)
    app.use('/brands', allRouters.brandRoutes)
    app.use('/products', allRouters.productRouters)
    app.use('/coupons', allRouters.couponRouters)
    app.use('/carts', allRouters.cartRouters)
    app.use('/orders', allRouters.orderRouters)
    app.use('/reviews', allRouters.reviewRouters)

    app.all('*', (req, res, next) => {
        return next(new AppError(`404 Not Found url ${req.originalUrl} ...`, 404))
    })
    //app.all === app.use , but app.all is more dynamic


    // after all routers ....
    app.use(globalErrorMiddleware())

    // cronChangeInvalidCoupons....
    cronChangeInvalidCoupons()


    app.listen(process.env.PORT, () => { console.log("server is running ....") })




}