const express=require('express');
const hostRouter=express.Router();
const path=require('path');
hostRouter.get('/host/add-home',(req,res,next)=>{
    
    res.sendFile(path.join(__dirname,'..','views','addHome.html'));
 });
 const registerHome=[];
 hostRouter.post('/host/add-home',(req,res,next)=>{
      console.log("Home registered successfully : ",req.body, req.body.houseName);
      registerHome.push({houseName: req.body.houseName});
      res.sendFile(path.join(__dirname,'..','views','homeAdded.html'));
 })

module.exports=hostRouter;
module.exports.registerHome=registerHome;