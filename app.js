// const waveformData = require('waveform-data');
const hbs = require('hbs');
const Promise = require('promise');
const express = require('express');
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
const decode = require('audio-decode');
const WaveformData = require('waveform-data');
var AudioContext = require('web-audio-api').AudioContext
  , context = new AudioContext();
var router=express.Router();
const bodyParser = require("body-parser");
// var WaveSurfer=require("wavesurfer.js")

var newData="";
console.log(path.join(__dirname,"./js"));
const app=express();

const partialPaths=path.join(__dirname,"./templates/partials");
const viewPath=path.join(__dirname,"./templates/views");
const pubDir=path.join(__dirname,"./public");

app.use(express.static(pubDir));
app.use(express.static(path.join(__dirname,"./node_modules")));
app.set("view engine","hbs");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.set("views",viewPath);
hbs.registerPartials(partialPaths);


//Database
const pool=require("./config/pool");
pool.getConnection((err,connect)=>{
  if(err) throw err;
  console.log("Connected");
  connect.release();
});

app.get("/",(req,res)=>{   
  res.render("index")
});

//Insert Into Database
app.post("/database",(req,res)=>{  
  let sql=`INSERT INTO posts (div_className,div_title,segment_start,segment_end,annotation_text) VALUES ('${req.body.speakerName}','${req.body.annotationType}','${req.body.segmentStart}','${req.body.segmentEnd}','${req.body.annotationText}')`;
  pool.query(sql,(err,result)=>{
      if(err) throw err;
      console.log(result);
      console.log("Data Inserted")
  })
  console.log(req.body);
  res.send("Success");
});

//Update Database
app.post("/updatedatabase",(req,res)=>{  
    let sql=`Update  posts 
             SET div_className='${req.body.speakerName}',div_title='${req.body.annotationType}',segment_start='${req.body.segmentStart}',segment_end='${req.body.segmentEnd}',annotation_text='${req.body.annotationText}'
             WHERE segment_id='${req.body.segmentId}' `;
    pool.query(sql,(err,result)=>{
      if(err) throw err;
      console.log("Updated");
    })         
});

//Get Values From Database
app.post("/get-segments",(req,res)=>{
  let sql="Select * FROM posts";
  pool.query(sql,(err,result)=>{
    if(err) throw err;
    res.send(result);
  })  
});

//remove segments from database
app.post("/remove-segments",(req,res)=>{
  let sql=`DELETE FROM posts WHERE segment_id=${req.body.regionId}`;
  pool.query(sql,(err,result)=>{
    if(err) throw err;
    res.send(result);
  })
});

app.listen(3000,()=>{
  console.log("Listening on 3000");
});


