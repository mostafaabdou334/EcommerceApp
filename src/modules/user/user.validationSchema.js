import joi from 'joi'

export const signUpSchema = {

    body: joi.object({
        userName: joi.string().min(3).max(15).required().messages({ 'any.required': 'userName is required', 'string.min': 'userName length must be more than or equal to 3 characters', 'string.max': 'userName length must be less than or equal to 15 characters' }),
        email: joi.string().email({ maxDomainSegments: 2, tlds: { allow: ['com', 'org', 'net'] } }).required().messages({ 'any.required': 'email is required', 'string.email': 'must be valid email' }),  // tlds => top level domains
        password: joi.string().pattern(/^[A-Z][a-z0-9]{4,10}$/).required().messages({ 'any.required': 'password is required', 'string.pattern.base': 'password must contain characters' }),
        confirmedPassword: joi.valid(joi.ref('password')).required().messages({ 'any.required': 'confirmedPassword is required', 'any.only': 'confirmedPassword must match password' }),
        gender: joi.string().optional(),
        age: joi.number().required().messages({ 'any.required': 'age is required' }),
        phone: joi.string().pattern(/^01[0125][0-9]{8}$/).required().messages({ 'any.required': 'phone is required', 'string.pattern.base': 'phone must be in phone form' }),
    }).required()
}

// i write body as i receive data from body at signUp 
// userName: joi.string().min(3).max(15).required().messages({'any.required':'userName is required',}), // if you need to custmize error message
// so if i need to custmize error message ... so i should know type in output error to write it in messages({'any.required':'userName is required',}) ...
// in this case type was (any.required) and my message i need will be (userName is required)
//maxDomainSegments :2 => (most@gmail.com)  but not (most@gmail.edu.com) as it 3 not 2
//unknown(true) => it means that if data which sent in req .. has elements i dont make validate on it ... i need to throw it 
//يعنى مثلا انا باعت ف ال بضى مثلا رقم العربيه و انا اصلا رقم العربيه ده مش عامله اختبار بالتالى انا عاوزه يعديها 
//if unknown(false) => (default) ... any thing come and dont exist in valiation will catch in error

//// there is another method to apply required on all schema .. instead of i write required in every one....
// body:joi.object({}).options({presence:'require'}).required()  // by this form i made every thing in this schema is required 


//////////////////////////////////////////////////////////////////////////////////////////////////////////

// signInSchema ... i made it by .options({presence:'required'}) ...instead of make .required() in every field

export const signInSchema = {

    body: joi.object({
        email: joi.string().email({ maxDomainSegments: 2, tlds: { allow: ['com', 'org', 'net'] } }).messages({ 'any.required': 'email is required', 'string.email': 'must be valid email' }),  // tlds => top level domains
        password: joi.string().pattern(/^[A-Z][a-z0-9]{4,10}$/).messages({ 'any.required': 'password is required', 'string.pattern.base': 'password must contain characters' }),
    }).options({ presence: 'required' }).required()
}


//////////////////////////////////////////////////////////////////////////////////////////////////////////


// ChangePassword schema ....

export const changePasswordSchema = {

    body: joi.object({
        oldPassword: joi.string().pattern(/^[A-Z][a-z0-9]{4,10}$/).messages({ 'any.required': 'oldPassword is required', 'string.pattern.base': 'oldPassword must contain characters' }),
        newPassword: joi.string().pattern(/^[A-Z][a-z0-9]{4,10}$/).messages({ 'any.required': 'password is required', 'string.pattern.base': 'password must contain characters' }),
        confirmPassword: joi.valid(joi.ref('newPassword')).messages({ 'any.required': 'confirmPassword is required', 'any.only': 'confirmPassword must match password' }),

    }).options({ presence: 'required' }).required()
}




//////////////////////////////////////////////////////////////////////////////////////////////////////////


// updateProfile schema ....
//userName, age

export const updateProfileSchema = {

    body: joi.object({

        userName: joi.string().alphanum().min(3).max(15).messages({ 'any.required': 'userName is required' }),
        age: joi.number().messages({ 'any.required': 'age is required' }),

    }).options({ presence: 'required' }).required()
}
