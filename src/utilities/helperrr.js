

//===========================================>  how to modify slug   <==============================================

// slugify('some string', {
//     replacement: '-',  // replace spaces with replacement character, defaults to `-`
//     remove: undefined, // remove characters that match regex, defaults to `undefined`
//     lower: false,      // convert to lower case, defaults to `false`
//     strict: false,     // strip special characters except replacement, defaults to `false`
//     locale: 'vi',      // language code of the locale to use
//     trim: true         // trim leading and trailing replacement chars, defaults to `true`
//   })

//===========================================>  information about cors error   <==============================================

// cors => Cross-origin resource sharing
//      => i can make restricted servers which can only access to my server of my database by using cors .

// we can solve cors origin by to method...(manual , cors package)

//======>  by manual .... <=======

// 1- by manual ....

// 1-1 if i need all origins to access my server ....

    
    // app.use((req, res, next) => {

    //     // 1-1-1 i need to allow  the accepted urls to access my server ...
    //     res.setHeader("Access-Control-Allow-Origin", "*")

    //     // 1-1-2- i need to allow  the accepted urls to send any thing in header (like token) to my server ...
    //     res.setHeader("Access-Control-Allow-Headers", "*")

    //     // 1-1-3- i need to allow  the accepted urls to send any (request method) or (i can specify some methods only) as i like ...
    //     res.setHeader("Access-Control-Allow-Methods", "*")

    //     // 1-1-4- i need to allow  any private network like (postman or any localhost) to access my server (in this case my database is real server and frontend need to test my Apis ...) ...
    //     res.setHeader("Access-Control-Allow-Private-Network", true)
    //     // res.setHeader("Access-Control-Allow-Private-Network", true) => default is (false)

    //     return next()

    // })

    ///////////////////////////////
    
    // 1-2 if i need some origins to access my server ....

    // const whiteList = ["http://localhost:3000", undefined]; // here i can do all serves which can access my server of my database ,     // //  undefined => for postman .

    // app.use((req, res, next) => {

    //     // 1- i need to allow this url  ...

    //     if (req.originalUrl.includes("/auth/confirmedEmail")) {

    //         res.setHeader("Access-Control-Allow-Origin", "*")
    //         res.setHeader("Access-Control-Allow-Methods", "GET")
    //         return next()
    //     }

    //     // 2- i need to make sure that url who want to access my server is from whiteList or not ...

    //     if (!whiteList.includes(req.header('origin'))) {

    //         // req.header('origin') => it about url which need to access my server .
    //         return next(new AppError('Blocked By Cors !', 400))
    //     }

    //     // 3- if url passed this up condition , i will allowed to it features ...below...

    //     // 3-1- i need to allow  the accepted urls to access my server ...
    //     res.setHeader("Access-Control-Allow-Origin", "*")

    //     // 3-2- i need to allow  the accepted urls to send any thing in header (like token) to my server ...
    //     res.setHeader("Access-Control-Allow-Headers", "*")

    //     // 3-3- i need to allow  the accepted urls to send any (request method) or (i can specify some methods only) as i like ...
    //     res.setHeader("Access-Control-Allow-Methods", "*")

    //     // 3-4- i need to allow  any private network like (postman or any localhost) to access my server (in this case my database is real server and frontend need to test my Apis ...) ...
    //     res.setHeader("Access-Control-Allow-Private-Network", true)
    //     // res.setHeader("Access-Control-Allow-Private-Network", true) => default is (false)

    //     return next()

    // })