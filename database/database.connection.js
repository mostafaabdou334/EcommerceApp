import mongoose from "mongoose";

const databaseConnection = async()=>{

    return await mongoose.connect(process.env.DATABASE_url)
    .then((res) => { console.log("Connection has been established successfully.") })
    .catch((err) => { console.log('Unable to connect to the database:', err) })
}

export default databaseConnection