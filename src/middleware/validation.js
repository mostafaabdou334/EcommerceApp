


const reqMethods = ['body', 'params', 'query', 'headers', 'file', 'files']

export const validationCoreFunction = (schema) => {

    return (req, res, next) => {
        const validationErrorArray = []

        for (const key of reqMethods) {
            if (schema[key]) {
                const validateResult = schema[key].validate(req[key],{abortEarly:false})

                if (validateResult.error) {
                    validationErrorArray.push(validateResult.error.details)
                }

            }

        }

        if (validationErrorArray.length) {
           return res.status(400).json({ success: "fail",message: "validation error", errors: validationErrorArray })

        }

        next()
    }
}