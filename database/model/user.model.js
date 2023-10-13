import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import { systemRoles } from "../../src/utilities/systemRoles.js";

const userSchema = new Schema({

    userName: {
        type: String,
        required: true,
        lowercase: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    gender: {
        type: String,
        enum: ['male', 'female', 'not specified'],
        default: 'not specified'
    }
    ,
    age: {
        type: Number,
        required: true
    },
    phone: {
        type: String,
        required: true,
        // unique: true
    },
    role: {
        type: String,
        enum: [systemRoles.User, systemRoles.Admin, systemRoles.SuperAdmin],
        default: systemRoles.User,
        required: true,
    },
    address: {
        type: String
    },
    isDeleted: {
        type: Boolean,
        default: false
    },

    status: {
        type: String,
        enum: ['online', 'offline'],
        default: "offline"
    },
    isPasswordChanged: {
        type: Boolean,
        default: false
    },
    isConfirmed: {
        type: Boolean,
        default: false
    },
    profilePicture: {
        public_id: { type: String, },
        secure_url: { type: String, },
    },

    // we make default picture like facebook picture default
    token: String,
    customId: String,

    forgetCode: String,




}, { timestamps: true })


// // const hashPassword = bcrypt.hashSync(password, parseInt(process.env.SALT_ROUNDS))

// // using hooks to hash password ....
// userSchema.pre('save', function (next, hash) {
//     this.password = bcrypt.hashSync(this.password, parseInt(process.env.SALT_ROUNDS))
//     next()

// })

export const userModel = mongoose.model('user', userSchema)




// //    profilePicture: {
//     public_id: { type: String, default: "E-commerce%20defULT/user/istockphoto-1131164548-170667a_vpsqdn" },
//     secure_url: { type: String, default: "https://res.cloudinary.com/dmzcf0mxf/image/upload/v1695579879/E-commerce%20defULT/user/istockphoto-1131164548-170667a_vpsqdn.jpg" },
// },