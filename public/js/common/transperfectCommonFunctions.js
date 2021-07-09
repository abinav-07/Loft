//Update Transperfect Input Fields
function setTransperfectFields(segmentId) {
  $('#annotation-take').val($(`#${segmentId}`).attr('data-take'));
  $('#mic-activation-attempt').val(
    $(`#${segmentId}`).attr('data-mic-activation-attempt')
  );
  $('#annotation-iteration').val($(`#${segmentId}`).attr('data-iteration'));
  $('#micTap-minute').val(
    secondsToMinutes($(`#${segmentId}`).attr('data-mic-tap'))
  );
  $('#micTap-seconds').val(
    secondsToSeconds($(`#${segmentId}`).attr('data-mic-tap'))
  );
  $('#micTap-milliseconds').val(
    secondsToMilliseconds($(`#${segmentId}`).attr('data-mic-tap'))
  );
  $('#micOpen-start-minute').val(
    secondsToMinutes($(`#${segmentId}`).attr('data-mic-open'))
  );
  $('#micOpen-start-seconds').val(
    secondsToSeconds($(`#${segmentId}`).attr('data-mic-open'))
  );
  $('#micOpen-start-milliseconds').val(
    secondsToMilliseconds($(`#${segmentId}`).attr('data-mic-open'))
  );
  $('#micOpen-end-minute').val(
    secondsToMinutes($(`#${segmentId}`).attr('data-mic-close'))
  );
  $('#micOpen-end-seconds').val(
    secondsToSeconds($(`#${segmentId}`).attr('data-mic-close'))
  );
  $('#micOpen-end-milliseconds').val(
    secondsToMilliseconds($(`#${segmentId}`).attr('data-mic-close'))
  );

  /*$("#utterance-start-minute").val(secondsToMinutes($(`#${segmentId}`).data("utterance-start")));
    $("#utterance-start-seconds").val(secondsToSeconds($(`#${segmentId}`).data("utterance-start")));
    $("#utterance-start-milliseconds").val(secondsToMilliseconds($(`#${segmentId}`).data("utterance-start")));
    $("#utterance-end-minute").val(secondsToMinutes($(`#${segmentId}`).data("utterance-end")));        
    $("#utterance-end-seconds").val(secondsToSeconds($(`#${segmentId}`).data("utterance-end")));
    $("#utterance-end-milliseconds").val(secondsToMilliseconds($(`#${segmentId}`).data("utterance-end")));
    */
  $('#first-word-minute').val(
    secondsToMinutes($(`#${segmentId}`).attr('data-utterance-first-word-end'))
  );
  $('#first-word-seconds').val(
    secondsToSeconds($(`#${segmentId}`).attr('data-utterance-first-word-end'))
  );
  $('#first-word-milliseconds').val(
    secondsToMilliseconds(
      $(`#${segmentId}`).attr('data-utterance-first-word-end')
    )
  );
  $('#first-word-display-end-minute').val(
    secondsToMinutes(
      $(`#${segmentId}`).attr('data-utterance-first-word-display-end')
    )
  );
  $('#first-word-display-end-seconds').val(
    secondsToSeconds(
      $(`#${segmentId}`).attr('data-utterance-first-word-display-end')
    )
  );
  $('#first-word-display-end-milliseconds').val(
    secondsToMilliseconds(
      $(`#${segmentId}`).attr('data-utterance-first-word-display-end')
    )
  );
  $('#utterance-display-start-minute').val(
    secondsToMinutes($(`#${segmentId}`).attr('data-utterance-display-start'))
  );
  $('#utterance-display-start-seconds').val(
    secondsToSeconds($(`#${segmentId}`).attr('data-utterance-display-start'))
  );
  $('#utterance-display-start-milliseconds').val(
    secondsToMilliseconds(
      $(`#${segmentId}`).attr('data-utterance-display-start')
    )
  );
  $('#utterance-display-end-minute').val(
    secondsToMinutes($(`#${segmentId}`).attr('data-utterance-display-end'))
  );
  $('#utterance-display-end-seconds').val(
    secondsToSeconds($(`#${segmentId}`).attr('data-utterance-display-end'))
  );
  $('#utterance-display-end-milliseconds').val(
    secondsToMilliseconds($(`#${segmentId}`).attr('data-utterance-display-end'))
  );
  $('#final-text-minute').val(
    secondsToMinutes($(`#${segmentId}`).attr('data-final-text-display'))
  );
  $('#final-text-seconds').val(
    secondsToSeconds($(`#${segmentId}`).attr('data-final-text-display'))
  );
  $('#final-text-milliseconds').val(
    secondsToMilliseconds($(`#${segmentId}`).attr('data-final-text-display'))
  );
  $('#prompt-Id').val($(`#${segmentId}`).attr('data-prompt-id'));
  $('#transcription-area').val($(`#${segmentId}`).attr('data-actual-text'));
  $('#utterance-text-area').val($(`#${segmentId}`).attr('data-utterance-text'));
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
    player.play();
    $('#play-button').find($('.fa')).toggleClass('fa-play fa-pause');
  } else {
    spectrum.pause();
    player.pause();
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
