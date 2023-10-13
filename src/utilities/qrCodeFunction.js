
import QRCode from "qrcode"

export const generateQrCode = ({ data = '' } = {}) => {

    const qrCode = QRCode.toDataURL(JSON.stringify(data),
        {
            errorCorrectionLevel: 'H',
            type: 'image/jpeg',
            quality: 1,
            margin: 1,
            scale:7 ,
            color: {
                dark: "#010599FF",
                light: "#FFBF60FF"
            }
        })
    return qrCode

}

