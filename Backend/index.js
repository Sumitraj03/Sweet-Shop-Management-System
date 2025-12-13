import express from 'express'
import cookieParser from 'cookie-parser'
import dotenv from 'dotenv'
import connectDB from './utils/db.js';



import userRoutes from './Routes/user.routes.js'
const app = express();
dotenv.config();
connectDB();
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());



app.use('/api/auth',userRoutes);
const PORT = process.env.PORT;

app.get("/", (req, res) => {
  res.send("Backend is running");
});

app.listen(PORT,()=>{
    console.log(`server running on ${PORT}`);
    
})
