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

const partialPaths=path.join(__dirname,"./templates/partials")
const viewPath=path.join(__dirname,"./templates/views")
const pubDir=path.join(__dirname,"./public");

app.use(express.static(pubDir));
app.use(express.static(path.join(__dirname,"./node_modules")));
app.set("view engine","hbs")
app.set("views",viewPath)
hbs.registerPartials(partialPaths)

app.get("",(req,res)=>{

  res.render("index")})

app.post("/audio",function(req,res){
  fetch("https://file-examples.com/wp-content/uploads/2017/11/file_example_MP3_700KB.mp3")
  .then(response=>response.arrayBuffer())
  .then(data=>{
    const options={
      audio_context:context,
      array_buffer:data,
      scale:128
    };
    return new Promise((resolve, reject) => {
      WaveformData.createFromAudio(options, (err, waveform) => {
        if (err) {
          reject(err);
        }
        else {
          resolve(waveform);
        }
      });
    });
  })
  .then(waveform=>{
    res.send(waveform.channels)
  })

})

//
// app.post("/audio",(req,res)=>{
//   var strings=["rad","bla"];
//   var n = Math.floor(Math.random() * strings.length)
//   res.send((strings[n]))
// })

app.get("/audiofile",(req,res)=>{
  fetch("https://file-examples.com/wp-content/uploads/2017/11/file_example_MP3_700KB.mp3")
  .then(response=>response.arrayBuffer())
  .then(data=>{
    const options={
      audio_context:context,
      array_buffer:data,
      scale:128
    };
    newData=options;
    // return new Promise((resolve, reject) => {
    //   WaveformData.createFromAudio(options, (err, waveform) => {
    //     if (err) {
    //       reject(err);
    //     }
    //     else {
    //       resolve(waveform);
    //     }
    //   });
    // });
  })
  // .then(waveform => {
  //   console.log(`Waveform has ${waveform.channels} channels`);
  //   console.log(`Waveform has length ${waveform.length} points`);
  //     res.render("new",{
  //       data:waveform
  //     })
  // });

})

app.post("",(req,res)=>{

    console.log(newData);
    res.send(console.log("hellow"))
})
app.listen(3000,()=>{
  console.log("Listening on 3000");
})

// module.exports=WaveSurfer;
