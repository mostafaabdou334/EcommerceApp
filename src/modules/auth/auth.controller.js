import bcrypt from "bcrypt";
import { AppError } from "../../utilities/AppError.js";
import { userModel } from "../../../database/model/user.model.js";
import { sendEmailService } from "../../services/sendEmailService.js";
import cloudinary from "../../utilities/cloudinary.config.js";
import { generateQrCode } from "../../utilities/qrCodeFunction.js";
import { generateToken, verifyToken } from "../../utilities/tokenFunctions.js";
import { nanoid } from "nanoid";

/////////////////////////////////////////////////////////////////////////////////////////////////

// 1- signUp ......

export const signUp = async (req, res, next) => {

    const { userName, email, password, confirmedPassword, gender, age, phone, address, role } = req.body;

    if (password != confirmedPassword) {
        return next(new AppError("your password is not matching confirmedPassword ...", 400))
    }

    const userCheck = await userModel.findOne({ email })

    if (userCheck) {
        return next(new AppError("your email is already exist ...", 409))
    }

    const hashPassword = bcrypt.hashSync(password, parseInt(process.env.SALT_ROUNDS))

    let profilePicture = {}

    // check image uploading .
    const customId = nanoid()

    if (req.file) {

        const { public_id, secure_url } = await cloudinary.uploader.upload(req.file.path, {
            folder: `E-commerce/users/${customId}`,
        })
        profilePicture = { public_id, secure_url }

        req.imagePath = `E-commerce/users/${customId}`
    }

    if (!req.file) {
        const { public_id, secure_url } = await cloudinary.uploader.upload(`https://res.cloudinary.com/dmzcf0mxf/image/upload/v1695579879/E-commerce%20defULT/user/istockphoto-1131164548-170667a_vpsqdn.jpg`, {
            folder: `E-commerce/users/${customId}`,
        })
        profilePicture = { public_id, secure_url }

        req.imagePath = `E-commerce/users/${customId}`

    }



    const user = await userModel.create({ userName, email, password: hashPassword, gender, age, phone, address, role, profilePicture, customId })


    // confirm email ...

    const token = generateToken({ payLoad: { email }, signature: process.env.CONFIRM_SECRET_KEY, expiresIn: "1h" })
    const confirmEmailLink = `${req.protocol}://${req.headers.host}/auth/confirmedEmail/${token}`; // to call to confirm email API to make update in isConfirmed to be true
    const message = `<a href=${confirmEmailLink}> click her to confirm email</a>`; // once he click to this link he will be confirmed
    const isSentEmail = await sendEmailService({ to: email, subject: "confirmEmail", message })  // it will equal true or false

    if (!isSentEmail) {
        return next(new AppError("please try again later", 500)) //// so service did not work .
    }

    res.status(201).json({ message: "success", user })   // so service work correctly .

}

/////////////////////////////////////////////////////////////////////////////////////////////////

// 2- confirm email ......

export const confirmedEmail = async (req, res, next) => {

    const { token } = req.params       // from token

    const decodedData = verifyToken({ token, signature: process.env.CONFIRM_SECRET_KEY })

    if (!decodedData) {

        return next(new AppError("inValid token", 400))
    }

    const checkConfirmed = await userModel.findOneAndUpdate({ email: decodedData.email, isConfirmed: false }, { isConfirmed: true }, { new: true })

    if (!checkConfirmed) {
        // return res.status(400).json({ message: 'your email is already confirmed' })
        return next(new AppError(" your email is already confirmed or not exist ", 400))

    }

    return res.status(200).json({ message: 'success', checkConfirmed })


}

/////////////////////////////////////////////////////////////////////////////////////////////////

// 3- signIn ......

export const signIn = async (req, res, next) => {

    const { email, password } = req.body;

    const userCheck = await userModel.findOne({ email })

    if (!userCheck) {
        return next(new AppError("please signUp first...", 400))
    }

    if (userCheck.isConfirmed == false) {
        return next(new AppError("please confirm your email first", 409))
    }

    const match = bcrypt.compareSync(password, userCheck.password)  // true or false

    if (match) {
        const token = generateToken({ payLoad: { userId: userCheck._id, userEmail: userCheck.email, role: userCheck.role }, signature: process.env.SECRET_KEY, expiresIn: '1d' })
        await userModel.updateOne({ email: userCheck.email }, { isDeleted: false, status: "online", isPasswordChanged: false, token })
        res.status(200).json({ message: "success", token })
    }
    else {
        return next(new AppError("your email or password is not correct ...", 400))

    }



}

/////////////////////////////////////////////////////////////////////////////////////////////////

// 4- forgetPassword ....

// first solution by amira
// export const forgetPassword = async (req, res, next) => {

//     const { email } = req.body;   // from user

//     const userCheck = await userModel.findOne({ email })

//     if (!userCheck) {
//         return next(new AppError("your email is not exist ...", 409))
//     }

//     const code = nanoid()
//     const hashedCode = bcrypt.hashSync(code, parseInt(process.env.SALT_ROUNDS))
//     const token = generateToken({ payLoad: { userEmail: userCheck.email, sentCode: hashedCode }, signature: process.env.FORGETPASSWORD_KEY, expiresIn: '1d' })


//     const resetPasswordLink = `${req.protocol}://${req.headers.host}/auth/resetPassword/${token}`; // to call to confirm email API to make update in isConfirmed to be true
//     const message = `<a href=${resetPasswordLink}> click her to reset password</a>`; // once he click to this link he will be confirmed

//     const isSentEmail = await sendEmailService({ to: email, subject: "resetPassword", message })  // it will equal true or false

//     if (!isSentEmail) {
//         return next(new AppError("please try again later", 500)) //// so service did not work .
//     }

//     const user = await userModel.findOneAndUpdate({ email: userCheck.email }, { forgetCode: hashedCode }, { new: true })
//     res.status(200).json({ message: "success" })

// }

// second solution by aya
export const forgetPassword = async (req, res, next) => {

    const { email } = req.body;   // from user

    const userCheck = await userModel.findOne({ email })

    if (!userCheck) {
        return next(new AppError("your email is not exist ...", 409))
    }

    const code = nanoid()


    const message = `forget code is ${code}`; // once he click to this link he will be confirmed

    const isSentEmail = await sendEmailService({ to: email, subject: "resetPassword", message })  // it will equal true or false

    if (!isSentEmail) {
        return next(new AppError("please try again later", 500)) //// so service did not work .
    }

    const user = await userModel.findOneAndUpdate({ email: userCheck.email }, { forgetCode: code }, { new: true })
    res.status(200).json({ message: "success" })

}


/////////////////////////////////////////////////////////////////////////////////////////////////

// 5- resetPassword ....

// first solution by amira
// export const resetPassword = async (req, res, next) => {

//     const { token } = req.params       // from token
//     const { newPassword } = req.body

//     const decodedData = verifyToken({ token, signature: process.env.FORGETPASSWORD_KEY })

//     if (!decodedData) {

//         return next(new AppError("inValid token", 400))
//     }

//     const checkUser = await userModel.findOne({ email: decodedData.userEmail, forgetCode: decodedData.sentCode })
//     if (!checkUser) {
//         return next(new AppError("you already reset your password , try again to login", 400))
//     }


//     const hashedPassword = bcrypt.hashSync(newPassword, parseInt(process.env.SALT_ROUNDS))
//     const user = await userModel.findByIdAndUpdate(checkUser._id, { password: hashedPassword, isPasswordChanged: true, forgetCode: null }, { new: true })

//     return res.status(200).json({ message: 'success', user })


// }

// second solution by aya
export const resetPassword = async (req, res, next) => {

    const { newPassword, confirmPassword, email, forgetCode } = req.body

    const checkUser = await userModel.findOne({ email, forgetCode })
    if (!checkUser) {
        return next(new AppError("in valid code", 400))
    }

    if (newPassword != confirmPassword) {
        return next(new AppError("your password is not matching confirmedPassword ...", 400))
    }

    const hashedPassword = bcrypt.hashSync(newPassword, parseInt(process.env.SALT_ROUNDS))
    const user = await userModel.findByIdAndUpdate(checkUser._id, { password: hashedPassword, isPasswordChanged: true, forgetCode: null, status: "offline", isPasswordChanged: true, token: null }, { new: true })

    return res.status(200).json({ message: 'success', user })


}


/////////////////////////////////////////////////////////////////////////////////////////////////
// 4- changePassword ....

export const changPassword = async (req, res, next) => {

    const { password, _id } = req.authUser   // from token
    const { oldPassword, newPassword, confirmPassword } = req.body;   // from user

    if (newPassword != confirmPassword) {
        return next(new AppError("your password not match with confirm password", 400))
    }

    const match = bcrypt.compareSync(oldPassword, password)

    if (match) {

        const hashedPassword = bcrypt.hashSync(newPassword, parseInt(process.env.SALT_ROUNDS))
        const user = await userModel.findByIdAndUpdate(_id, { password: hashedPassword, isPasswordChanged: true }, { new: true })

        res.status(200).json({ message: "success", user })
    }
    else {
        return next(new AppError("old password does not match your password", 400))
    }
}


/////////////////////////////////////////////////////////////////////////////////////////////////

// 5- update user (age , userName , phone , profilePicture)

export const updateProfile = async (req, res, next) => {

    const { _id } = req.authUser       // from token
    const { userName, age, phone } = req.body      // from user


    const user = await userModel.findById(_id)

    if (userName) {
        user.userName = userName

    }
    if (age) {
        user.age = age

    }
    if (phone) {
        user.phone = phone
    }


    if (req.file) {

        await cloudinary.uploader.destroy(user.profilePicture.public_id)

        const { public_id, secure_url } = await cloudinary.uploader.upload(req.file.path, {
            folder: `E-commerce/users/${user.customId}`,
        })

        user.profilePicture = { public_id, secure_url }

        req.imagePath = `E-commerce/users/${user.customId}`
    }
    await user.save()

    return res.status(200).json({ message: 'success', user })

}

//////////////////////////////////////////////////////////////////////////////////

// 6- delete user

export const deleteOneUser = async (req, res, next) => {

    const { _id } = req.authUser       // from token

    const user = await userModel.findByIdAndDelete(_id)
    // await cloudinary.uploader.destroy(user.profilePicture.public_id) // here i will delete pictures only not folder , so we can not use it .
    await cloudinary.api.delete_resources_by_prefix(`E-commerce/users/${user.customId}`)  // to delete all photos inside every folder in this path and give it the path of this folders
    await cloudinary.api.delete_folder(`E-commerce/users/${user.customId}`)  // now i can delete this folder after deleting every photos inside it


    return res.status(200).json({ message: 'success', user })


}

//////////////////////////////////////////////////////////////////////////////////

// 6- soft delete user

export const softDeleteUser = async (req, res, next) => {

    const { _id } = req.authUser       // from token

    const user = await userModel.findByIdAndUpdate(_id, { isDeleted: true }, { new: true })

    return res.status(200).json({ message: 'success', user })


}

//////////////////////////////////////////////////////////////////////////////////

// 7- logOut

export const logOut = async (req, res, next) => {

    const { _id } = req.authUser       // from token

    const user = await userModel.findByIdAndUpdate(_id, { status: "offline" }, { new: true })

    return res.status(200).json({ message: 'success', user })


}

//////////////////////////////////////////////////////////////////////////////////

//======================================== cloud multer =======================================

// 8- profilePicture20
// upload profilePicture20 to cloudinary and to database

export const profilePicture20 = async (req, res, next) => {

    const { _id } = req.authUser       // from token

    if (!req.file) {
        return next(new AppError('please upload your profile picture', 400))
    }

    const { public_id, secure_url } = await cloudinary.uploader.upload(req.file.path, {
        folder: `E-commerce/users/profiles/${_id}`, // to create path to save in it
        use_filename: true,    // to control in (public_id) to save (asset) by (path +(original-filename+unique word)) to dont make overwrite
        unique_filename: false,  // to dont add new unique word extra in (public_id)
        resource_type: 'image',  // to limit data type to be image only
    })


    const user = await userModel.findByIdAndUpdate(_id, { profilePicture: { public_id, secure_url } }, { new: true })
    if (!user) {

        const resultData = await cloudinary.uploader.destroy(public_id)
        return next(new AppError('please try again later , fail to add profile picture', 400))
    }

    return res.status(200).json({ message: 'success', user })

}

//////////////////////////////////////////////////////////////////////////////////

// 9- updateProfilePicture20
// updateProfilePicture20 to cloudinary and to database

export const updateProfilePicture20 = async (req, res, next) => {

    const { _id } = req.authUser       // from token

    if (!req.file) {
        return next(new AppError('please upload your profile picture', 400))
    }

    const findUser = await userModel.findById(_id)

    const resultData = await cloudinary.uploader.destroy(findUser.profilePicture.public_id)

    const { public_id, secure_url } = await cloudinary.uploader.upload(req.file.path, {
        folder: `E-commerce/users/profiles/${_id}`, // to create path to save in it
        use_filename: true,    // to control in (public_id) to save (asset) by (path +(original-file name+unique word)) to dont make overwrite
        unique_filename: false,  // to dont add new unique word extra
        resource_type: 'image',  // to limit data type to be image only
    })

    const user = await userModel.findByIdAndUpdate(_id, { profilePicture: { public_id, secure_url } }, { new: true })
    if (!user) {

        const resultData = await cloudinary.uploader.destroy(public_id)
        console.log(resultData) // => (it will ok ..if it deleted) .... and (if not deleted it will be nt found)
        // if there is not user so i do not need to save in cloudinary ...so i should delete it from host
        return next(new AppError('please try again later , fail to update profile picture', 400))

    }
    return res.status(200).json({ message: 'success', user })


}
//////////////////////////////////////////////////////////////////////////////////

// 10- coverPictures21 using (array)
// upload coverPictures21 to cloudinary and to database

export const coverPictures21 = async (req, res, next) => {

    const { _id } = req.authUser       // from token

    if (!req.files) {
        return next(new AppError('please upload your cover picture', 400))
    }
    let coverImages = []
    let coverImagesPublic_ids = []


    for (const file of req.files) {

        const { public_id, secure_url } = await cloudinary.uploader.upload(file.path, {
            folder: `E-commerce/users/coverPictures/${_id}`, // to create path to save in it
            use_filename: true,    // to control in (public_id) to save (asset) by (path +(original-file name+unique word)) to dont make overwrite
            unique_filename: false,  // to dont add new unique word extra
            resource_type: 'image',  // to limit data type to be image only
        })

        coverImages.push({ public_id, secure_url })
        coverImagesPublic_ids.push(public_id)

    }

    const user = await userModel.findById(_id)

    if (!user) {
        const resultData = await cloudinary.api.delete_resources(coverImagesPublic_ids)  // to delete more than pic
        console.log(resultData) // => (it will ok ..if it deleted) .... and (if not deleted it will be nt found)
        // if there is not user so i do not need to save in cloudinary ...so i should delete it from host
        return next(new AppError('please try again later , fail to add coverImages', 400))

    }

    if (user.coverPicture.length) {
        coverImages.push(...user.coverPicture)
    }

    const newUser = await userModel.findByIdAndUpdate(_id, { coverPicture: coverImages }, { new: true })


    return res.status(200).json({ message: 'success', newUser })


}
////////////////////////////////////////////////////////////////////////////////////////////////////////////

//======================================== generate qr code =======================================

// 11- get pfrofile and generate qr code ..

export const getUserProfile = async (req, res, next) => {

    const { _id } = req.authUser       // from token

    const user = await userModel.findById(_id).select(['-coverPicture', '-profilePicture'])

    if (!user) {
        return next(new AppError("your user is not found", 400))
    }

    const qrCode = await generateQrCode({ data: user })
    return res.status(200).json({ message: 'success', user, qrCode })

}
