
import path from 'path'
import { config } from 'dotenv'
config({path:path.resolve('./config/config.env')})

import {v2 as cloudinary} from 'cloudinary'

cloudinary.config({
    api_key:process.env.API_KEY ,
    api_secret:process.env.API_SECRET ,
    cloud_name:process.env.CLOUD_NAME ,
})

export default cloudinary