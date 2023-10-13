import path from 'path'
import { config } from 'dotenv'
config({path:path.resolve('./config/config.env')})
import express from 'express'
import { initiateApp } from './src/utilities/initiateApp.js'




const app = express()

initiateApp(app,express)