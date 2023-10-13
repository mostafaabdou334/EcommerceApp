
// this function will call when any route have error in next()
//

export function globalErrorMiddleware() {

    return (err, req, res, next) => {
        let status = err.statusCode || 500   // as errors came from try and catch (errorHandling.js)
        if (process.env.Mode == "prod") {
            res.status(status).json({ success: "fail", message: err.message })

        }
        else {
            res.status(status).json({ success: "fail", message: err.message, stack: err.stack })

        }

    }
}