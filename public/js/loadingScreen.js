/* utiluty functions */

function UpdateLoadingFlag(Percentage) {
    if (document.getElementById("loading_flag")) {
        document.getElementById("loading_flag").innerText = "Loading " + Percentage + "%";
        if (Percentage >= 100) {
            document.getElementById("loading_flag").style.display = "none";
        } else {
            document.getElementById("loading_flag").style.display = "block";
        }
    }
}
/* wavesurfer functions */


// show progress while loading sound
function displayWaveSurferLoading() {
    spectrum.on('loading', function(X, evt) {
        UpdateLoadingFlag(X);
    });
}