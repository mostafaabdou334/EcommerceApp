
import jwt from 'jsonwebtoken';


// ============================================= > generate token  <===================================================

export const generateToken = ({

    payLoad = {},  // {} => default value ,
    signature = process.env.DEFAULT_SIGNATURE, // process.env.DEFAULT_SIGNATURE => default value,
    expiresIn = '1d' } = {}) => {

    // we should check if there is payload or not .. if not so we should return false to resend correct data
    if (!Object.keys(payLoad).length) {
        return false
    }
    const token = jwt.sign(payLoad, signature, { expiresIn })

    return token

}

// ============================================= > verify token  <===================================================
    // jwt.verify(token, process.env.CONFIRM_SECRET_KEY, async (err, decoded) => {})


export const verifyToken = ({

    token = '',  // {} => default value ,
    signature = process.env.DEFAULT_SIGNATURE, // process.env.DEFAULT_SIGNATURE => default value,
     } = {}) => {

    // we should check if there is payload or not .. if not so we should return false to resend correct data
    if (!token) {

        return false
    }
    const data = jwt.verify(token, signature)

    return data

}