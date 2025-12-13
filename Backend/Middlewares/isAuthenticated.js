import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
dotenv.config()

export const isAuthenticated = async(req,res,next)=>{
    try {
        const {token} = req.cookies.token;
        if(!token){
            return res.status(401).json({
                message:"User not Authenticated",
                success:false
            })
        }

        const verifyToken = jwt.verify(token,process.env.JWT_SECRET);
        if(!verifyToken){
            return res.status(401).json({
                message:"Token is invalid",
                success:false
            })
        }

        req.id = verifyToken.userId;
        next();
    } catch (error) {
        console.log(error);
        
        return res.status(500).json({
            message:"Internal server error on verifying token",
            success:false
        })
    }
}