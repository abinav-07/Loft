const hbs = require('hbs');
const express = require('express');
const fs = require('fs');
const path = require('path');
const viewPath=path.join(__dirname,"./templates/views")

app.set("view engine","hbs")
app.set("views",viewPath)


app.get("",(req,res)=>{
  res.render("index")})

app.listen(3000,()=>{
    console.log("Listening on 3000");
})
