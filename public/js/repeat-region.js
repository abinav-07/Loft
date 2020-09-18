//function to repeat a region
function repeatRegion() {
    var timestamp;
    if (spectrum.regions.list[currentId] != null) {
        var start = spectrum.regions.list[currentId].start;
        var end = spectrum.regions.list[currentId].end;
        timestamp = (end);

        spectrum.regions.list[currentId].play(start, end);
        //spectrum.pause();

        //updateTimer();
        highlightRegion();
    }
    spectrum.on("pause", function() {
        document.getElementById('start-timestamp').innerText = (secondsToTimestamp(end));
    })

} //function repeatRegion End