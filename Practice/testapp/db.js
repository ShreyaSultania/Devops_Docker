import mongoose from "mongoose";
const connectDB = async()=>{
  try{
    await mongoose.connect("mongodb://admin:qwerty@localhost:27017/test?authSource=admin");
    console.log("MongoDB connected to test database");
  }
  catch(err){
    console.error(err);
    process.exit(1);
  }
}
export default connectDB;