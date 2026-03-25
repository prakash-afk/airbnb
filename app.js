//External Modules
const express=require('express');

//Local Modules
const userRouter=require('./routes/userRouter');
const hostRouter=require('./routes/hostRouter');
const app=express();
//core modules
const path=require('path');

app.set('view engine','ejs'); // to set the view engine as ejs
app.use(express.static(path.join(__dirname,'public'))); // to serve static files like css,js,images

app.use(express.urlencoded({extended:true})); // to parse the form data

app.use(userRouter);
app.use(hostRouter);
app.use((req,res,next)=>{
      res.status(404).render('404');
})


 app.listen(3001,()=>{
    console.log('Server running at http://localhost:3001/');
 })