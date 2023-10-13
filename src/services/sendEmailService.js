import nodemailer from 'nodemailer'

export async function sendEmailService({ to, subject, message, attachments } = {}) {

    const transporter = nodemailer.createTransport({

        host: 'localhost',   
        port: 587, 
        secure: false,    
        service: 'gmail',   

        auth: {
            user: 'mostafaabdou334@gmail.com',
            pass: 'fvxiswywrqezyefy',   // app password from gmail .

        },

    });

    const emailInfo = await transporter.sendMail({

        from: '"E-commerce app 👻" <mostafaabdou334@gmail.com>',
        to: to ? to : "",
        // cc:['',''],
        // bcc:['',''],
        subject: subject ? subject : "",
        html: message ? message : "",  // if there is html code inside message
        // text:message   // if there is not html code inside message
        attachments: attachments ? attachments : [],

    })

    // console.log(emailInfo)

    if (emailInfo.accepted.length) {

        return true    // so sendEmailService function will return true
    }

    return false       // so sendEmailService function will return false

}