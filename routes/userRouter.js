

const express=require('express');
const userRouter=express.Router();
const registerHome=require('./hostRouter').registerHome;
userRouter.get('/',(req,res,next)=>{
    console.log("Registered Homes : ", registerHome);
    res.render('home', { registerHome });
 });

 module.exports=userRouter;