import mongoose from "mongoose";

const connectMongo = async ()=>{
    try{
        const conn = await mongoose.connect(process.env.MONGO_URL);
        console.log("Connected to the MongoDB: " + conn.connection.host);
    }
    catch(error){
        console.log("Error connecting to MOngoDB: " + error.message)
        process.exit(1);
    }
}

export default connectMongo;