//Update Transperfect Input Fields
function setTransperfectFields(segmentId) {
  console.log(segmentId);
  // console.log(`#${segmentId}`).attr('data-date-of-delivery');
  $('#annotation-latency').val($(`#${segmentId}`).attr('data-latency'));
  $('#transcription-area').val($(`#${segmentId}`).attr('data-wake-word'));
  $('#date-of-delivery').val($(`#${segmentId}`).attr('data-date-of-delivery'));
  $('#command').val($(`#${segmentId}`).attr('data-command'));
  $('#wake-word-start-minute').val(
    secondsToMinutes($(`#${segmentId}`).attr('data-wake-word-start'))
  );
  $('#wake-word-start-seconds').val(
    secondsToSeconds($(`#${segmentId}`).attr('data-wake-word-start'))
  );
  $('#wake-word-start-milliseconds').val(
    secondsToMilliseconds($(`#${segmentId}`).attr('data-wake-word-start'))
  );
  $('#wake-word-end-minute').val(
    secondsToMinutes($(`#${segmentId}`).attr('data-wake-word-end'))
  );
  $('#wake-word-end-seconds').val(
    secondsToSeconds($(`#${segmentId}`).attr('data-wake-word-end'))
  );
  $('#wake-word-end-milliseconds').val(
    secondsToMilliseconds($(`#${segmentId}`).attr('data-wake-word-end'))
  );
  $('#command-start-minute').val(
    secondsToMinutes($(`#${segmentId}`).attr('data-command-start'))
  );
  $('#command-start-seconds').val(
    secondsToSeconds($(`#${segmentId}`).attr('data-command-start'))
  );
  $('#command-start-milliseconds').val(
    secondsToMilliseconds($(`#${segmentId}`).attr('data-command-start'))
  );

  /*$("#utterance-start-minute").val(secondsToMinutes($(`#${segmentId}`).data("utterance-start")));
    $("#utterance-start-seconds").val(secondsToSeconds($(`#${segmentId}`).data("utterance-start")));
    $("#utterance-start-milliseconds").val(secondsToMilliseconds($(`#${segmentId}`).data("utterance-start")));
    $("#utterance-end-minute").val(secondsToMinutes($(`#${segmentId}`).data("utterance-end")));        
    $("#utterance-end-seconds").val(secondsToSeconds($(`#${segmentId}`).data("utterance-end")));
    $("#utterance-end-milliseconds").val(secondsToMilliseconds($(`#${segmentId}`).data("utterance-end")));
    */
  $('#start-of-assistant-minute').val(
    secondsToMinutes($(`#${segmentId}`).attr('data-start-of-assistant'))
  );
  $('#start-of-assistant-seconds').val(
    secondsToSeconds($(`#${segmentId}`).attr('data-start-of-assistant'))
  );
  $('#start-of-assistant-milliseconds').val(
    secondsToMilliseconds($(`#${segmentId}`).attr('data-start-of-assistant'))
  );
}
//Update Transperfect Input Fields End

//Show More Button Functionality
function displayUtterancesBtnClick() {
  const utteranceDiv = $('#utterance-div');

  if (utteranceDiv.css('display') == 'none') {
    utteranceDiv.show();
  } else {
    utteranceDiv.hide();
  }
}

//Wavesurfer and video player play pause
function playPauseSpectrum() {
  var playing = spectrum.isPlaying();
  if (!playing) {
    spectrum.play();
    // player.play();
    $('#play-button').find($('.fa')).toggleClass('fa-play fa-pause');
  } else {
    spectrum.pause();
    // player.pause();
    $('#play-button').find($('.fa')).toggleClass('fa-pause fa-play');
  }
  return playing;
}

function pauseSpectrum() {
  if (spectrum.isPlaying()) {
    spectrum.pause();
    player.pause();
    $('#play-button').find($('.fa')).toggleClass('fa-pause fa-play');
  }
}
