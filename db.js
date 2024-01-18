const mongoose = require('mongoose');
require('dotenv').config();

const mongoURI = process.env.REACT_APP_MONGO_DB_URI

const connectToMongo = ()=>{
    // console.log(mongoURI)
    mongoose.connect(mongoURI).then(()=>console.log("Connected to mongo Atlas")).catch((e)=>console.log(e.message))
}

module.exports = connectToMongo;