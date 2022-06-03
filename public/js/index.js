// <script src="https://unpkg.com/wavesurfer.js"></script>

// var WaveSurfer=require("wavesurfer.js")

<script src="public/js/create-div.js"></script>;

var buttons = {
  play: document.getElementById('play-button'),
  stop: document.getElementById('stop-button'),
};
var spectrum = WaveSurfer.create({
  container: '#wave',
  waveColor: 'violet',
  progressColor: 'purple',
});

buttons.play.addEventListener('click', function () {
  var context = new AudioContext();
  context.resume();
  spectrum.play();
  buttons.play.disabled = true;
  buttons.stop.disabled = false;
});

buttons.stop.addEventListener('click', function () {
  spectrum.pause();
  buttons.stop.disabled = true;
  buttons.play.disabled = false;
});
spectrum.on('ready', function () {
  buttons.play.disabled = false;
});
