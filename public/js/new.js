//
// const waveformData = require('waveform-data');
// const decode = require('audio-decode');
// const path = require('path');
// const express = require('express');
// const audio = require('audio-lena/mp3');
//
// const app=express()
// app.use(express.static(path.join(__dirname,"./js")));
//
// var arr=[];



const audioContext=new AudioContext();
fetch("https://file-examples.com/wp-content/uploads/2017/11/file_example_MP3_700KB.mp3")
.then(response=>response.arrayBuffer())
.then(data=>{
  const options={
    audio_context:audioContext,
    array_buffer:data,
    scale:128
  };
  return new Promise((resolve,reject)=>{

  })
})
//
// fs.readFile("example.mp3",function(err,data){
//   if(err){
//     console.log(err);
//   }
  // var audioBuffer=data.arrayBuffer()
  // var buffer=Buffer.from(JSON.stringify(data));
  // var bufferedWave=waveformData.create(data);
  // console.log(buffer);



  //console.log(Buffer.from(JSON.stringify(data)));
  // arr=[...Buffer.from(JSON.stringify(data))];
  //  var bufferedWave=waveformData.create(arr);
  // console.log(arr);
  // console.log(JSON.parse(buffered.toString()));
  // console.log(buffered);

  //   const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  //
  //   fetch("https://file-examples.com/wp-content/uploads/2017/11/file_example_MP3_700KB.mp3")
  //   .then(response => response.arrayBuffer())
  // .then(buffer => {
  //   const options = {
  //     audio_context: audioContext,
  //     array_buffer: buffer,
  //     scale: 128
  //   };
  //
  //   return new Promise((resolve, reject) => {
  //     WaveformData.createFromAudio(options, (err, waveform) => {
  //       if (err) {
  //         reject(err);
  //       }
  //       else {
  //         resolve(waveform);
  //       }
  //     });
  //   });
  // })
  // .then(waveform => {
  //   console.log(`Waveform has ${waveform.channels} channels`);
  //   console.log(`Waveform has length ${waveform.length} points`);
  // });


    // var source;
    // var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    // // audioCtx.decodeAudioData()
    // function getData(){
    //    source=audioCtx.createBufferSource();
    //   var request = new XMLHttpRequest();
    //
    //   request.open('GET', 'https://file-examples.com/wp-content/uploads/2017/11/file_example_MP3_700KB.mp3', true);
    //   request.responseType="arraybuffer"
    //   request.onload=function(){
    //     var audioData=request.response;
    //     audioCtx.decodeAudioData(audioData,function(buffer){
    //         source.buffer=buffer;
    //         source.connect(audioCtx.destination);
    //         source.loop=true;
    //     })
    //     console.log(audioData);
    //   }
    //   request.send();
    // }

// })
