//function to repeat a region
function repeatRegion() {
  var timestamp;
  if (spectrum.regions.list[currentId] != null) {
    var start = spectrum.regions.list[currentId].start;
    var end = spectrum.regions.list[currentId].end;
    timestamp = end;

    spectrum.regions.list[currentId].play(start, end);
    //spectrum.pause();

    //updateTimer();
    highlightRegion();
  }
  spectrum.on('pause', function () {
    document.getElementById('start-timestamp').innerText =
      secondsToTimestamp(end);
    document.getElementById('start-time-hour').innerText = secondsToHours(end);
  });
} //function repeatRegion End

function repeatMarker(startTime, endTime) {
  var timestamp;
  if (
    spectrum.regions.list[currentId] != null &&
    startTime > 0 &&
    endTime > 0
  ) {
    var end = spectrum.regions.list[currentId].end;
    timestamp = end;

    spectrum.play(parseFloat(startTime), parseFloat(endTime));
    //spectrum.pause();

    //    updateTimer();
    //  highlightRegion();
  }
}
