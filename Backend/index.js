import express, { urlencoded } from 'express'
import cookieParser from 'cookie-parser'
import dotenv from 'dotenv'
import connectDB from './utils/db.js';

const app = express();
dotenv.config();
connectDB();
app.use(express.json());
app.use(urlencoded({extended:true}));
app.use(cookieParser());

const PORT = process.env.PORT;

app.listen(PORT,()=>{
    console.log(`server running on ${PORT}`);
    
})
