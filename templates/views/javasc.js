console.log("This is it")
fetch("https://file-examples.com/wp-content/uploads/2017/11/file_example_MP3_700KB.mp3")
.then(response=>response.arrayBuffer())
.then(buffer=>waveformData.create(buffer))
.then(waveform=>{
    console.log(`WaveForm ${waveform.channels}`);
})
