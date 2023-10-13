import { userModel } from "../../database/model/user.model.js"
import { AppError } from "../utilities/AppError.js"
import { generateToken, verifyToken } from '../utilities/tokenFunctions.js'


export const isAuth = (roles) => {

    return async (req, res, next) => {

        try {
            const { token } = req.headers

            if (!token) {

                return next(new AppError("please signIn first or send token", 400))
            }
            
            if (!token.startsWith(process.env.TOKEN_PREFIX)) {
                return next(new AppError('invalid token prefix', 400))
            }

            const splitedToken = token.split(process.env.TOKEN_PREFIX)[1]  // here i have real token .

            try {


                const decodedData = verifyToken({ token: splitedToken, signature: process.env.SECRET_KEY })

                if (!decodedData) {

                    return next(new AppError("inValid token", 400))
                }

                const findUser = await userModel.findById(decodedData.userId)  // check user exist

                if (!findUser) {

                    return next(new AppError("please signUp", 409))

                }

                if (findUser.token != splitedToken) {

                    return next(new AppError("invalid token , please signIn", 409))

                }

                // check if user logOut or make softDelete or dont confirm email ....

                if (findUser.isConfirmed == false) {

                    return next(new AppError("please confirm your email first", 409))

                }

                if (findUser.isDeleted == true || findUser.status == "offline") {

                    return next(new AppError("this email is softDeleted or logOut please login again", 400))

                }

                if (findUser.isPasswordChanged == true) {

                    return next(new AppError("please signIn again", 400))

                }

                if (!roles.includes(findUser.role)) {

                    return next(new AppError("you are not authorized to access this Api", 401))

                }
                req.authUser = findUser
                next()

            }

            catch (error) {

                if (error == 'TokenExpiredError: jwt expired') {

                    // we should her generate refresh token so we need this user .....

                    const User = await userModel.findOne({ token: splitedToken })

                    if (!User) {
                        return next(new AppError("invalid token please signUp", 409))
                    }

                    // generate new token ...

                    const token = generateToken({ payLoad: { userId: User._id, userEmail: User.email, role:User.role }, signature: process.env.SECRET_KEY, expiresIn: "1d" })
                    await userModel.updateOne({ token: User.token }, { isDeleted: false, status: "online", isPasswordChanged: false, token })
                    return res.status(200).json({ message: "success", token })

                    // note expire time in refresh token should be more than main token .
                }

                // if any error else (jwt expired)
                return next(new AppError(error, 400))

            }

        } catch (error) {

            return next(new AppError("invalid token", 400))

        }
    }
}


