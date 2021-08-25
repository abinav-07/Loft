function checkInputFieldOnKeyPress(event) {
  if (
    event.target.tagName.toUpperCase() !== 'INPUT' &&
    event.target.tagName.toUpperCase() !== 'TEXTAREA'
  )
    return true;
  return false;
}

//Function to update input fields timers on shortcut keys events
function updateFieldOnShortCutPress(
  minuteInputId, //Minute Input Id
  secondsInputId, //Seconds Input Id
  millisecondsInputId //MS Input Id
) {
  var currentTime = spectrum.getCurrentTime();
  updateAnnotationOnChange = true;
  updateAnnotationOnClick = true;

  //Timer Values to set
  var minutes = secondsToMinutes(currentTime);
  var seconds = secondsToSeconds(currentTime);
  var milliseconds = secondsToMilliseconds(currentTime);

  minuteInputId.val(minutes);
  secondsInputId.val(seconds);
  millisecondsInputId.val(milliseconds);
}

function ltKeyEvents(spectrum) {
  //Add Region on key down
  $('html').on('keydown', function (event) {
    if (!updateTopDivSpeaker) {
      if (event.ctrlKey && event.shiftKey && event.which == 65) {
        //console.log("Pressed");
        event.preventDefault();
        addRegion();
        if (
          addRegionBool == true &&
          !updateAnnotationOnChange &&
          !updateTopDivSpeaker
        ) {
          renew();
        }
      }
    }

    //Replay Region on KeyDown
    if (
      ((event.altKey && event.which == 82) || event.which == 82) &&
      checkInputFieldOnKeyPress(event)
    ) {
      event.preventDefault();
      repeatRegion();
    }
    //Replay Function end

    //play pause on space bar
    if (
      (event.which == 32 || event.which == 96 || event.which == 48) &&
      checkInputFieldOnKeyPress(event)
    ) {
      if (playPauseAudio()) highlightRegion();
    } else if (
      event.ctrlKey &&
      event.which == 32 &&
      checkInputFieldOnKeyPress(event)
    ) {
      if (playPauseAudio()) highlightRegion();
    } //Play Pause End

    //skip audio backwards 500ms on "8" pressed
    if (
      (event.which == 104 || event.which == 56) &&
      checkInputFieldOnKeyPress(event)
    ) {
      event.preventDefault();
      skipAudio(-0.5);
    }

    //skip audio backwards 500ms on "5" pressed
    if (
      (event.which == 101 || event.which == 53) &&
      checkInputFieldOnKeyPress(event)
    ) {
      event.preventDefault();
      skipAudio(0.5);
    }

    //jump audio to start
    if (
      event.which == 36 ||
      (event.which == 18 &&
        event.which == 37 &&
        checkInputFieldOnKeyPress(event))
    ) {
      event.preventDefault();
      spectrum.seekTo(0);
    }

    //jump audio to end
    if (event.which == 35 && checkInputFieldOnKeyPress(event)) {
      event.preventDefault();
      skipAudio(spectrum.getDuration());
    }
  });
}

function ltTranscriptionKeyEvents(spectrum) {
  $('html').on('keydown', function (event) {
    //Replay Region on KeyDown
    if (
      ((event.altKey && event.which == 82) || event.which == 82) &&
      checkInputFieldOnKeyPress(event)
    ) {
      event.preventDefault();
      repeatRegion();
    }
    //Replay Function end

    //play pause on space bar
    if (
      (event.which == 32 || event.which == 96 || event.which == 48) &&
      checkInputFieldOnKeyPress(event)
    ) {
      if (playPauseSpectrum()) highlightRegion();
    } else if (
      event.ctrlKey &&
      event.which == 32 &&
      checkInputFieldOnKeyPress(event)
    ) {
      if (playPauseSpectrum()) highlightRegion();
    } //Play Pause End

    //skip audio backwards 500ms on "8" pressed
    if (
      (event.which == 104 || event.which == 56) &&
      checkInputFieldOnKeyPress(event)
    ) {
      event.preventDefault();
      skipAudio(-0.5);
    }

    //skip audio backwards 500ms on "5" pressed
    if (
      (event.which == 101 || event.which == 53) &&
      checkInputFieldOnKeyPress(event)
    ) {
      event.preventDefault();
      skipAudio(0.5);
    }

    //jump audio to start
    if (
      event.which == 36 ||
      (event.which == 18 &&
        event.which == 37 &&
        checkInputFieldOnKeyPress(event))
    ) {
      event.preventDefault();
      spectrum.seekTo(0);
    }

    //jump audio to end
    if (event.which == 35 && checkInputFieldOnKeyPress(event)) {
      event.preventDefault();
      skipAudio(spectrum.getDuration());
    }
  });
}

function transperfectKeyEvents(spectrum) {
  //Common Events
  ltKeyEvents(spectrum);
  //Transperfect Events
  $('html').on('keydown', function (event) {
    //play pause on space bar
    if (
      (event.which == 32 || event.which == 96 || event.which == 48) &&
      checkInputFieldOnKeyPress(event)
    ) {
      if (playPauseSpectrum()) highlightRegion();
    } else if (
      event.ctrlKey &&
      event.which == 32 &&
      checkInputFieldOnKeyPress(event)
    ) {
      if (playPauseSpectrum()) highlightRegion();
    } //Play Pause End
    /*
    //CTRL+SHIFT+M MIC TAP
    if (event.ctrlKey && event.shiftKey && event.which === 77) {
      event.preventDefault();
      updateFieldOnShortCutPress(
        $('#micTap-minute'),
        $('#micTap-seconds'),
        $('#micTap-milliseconds')
      );
    }

    //Ctrl+shift+o Mic OPEN
    if (event.ctrlKey && event.shiftKey && event.which === 79) {
      event.preventDefault();
      updateFieldOnShortCutPress(
        $('#micOpen-start-minute'),
        $('#micOpen-start-seconds'),
        $('#micOpen-start-milliseconds')
      );
    }

    //ctrl+shif+c Mic Close
    if (event.ctrlKey && event.shiftKey && event.which === 67) {
      event.preventDefault();
      updateFieldOnShortCutPress(
        $('#micOpen-end-minute'),
        $('#micOpen-end-seconds'),
        $('#micOpen-end-milliseconds')
      );
    }

    //Ctrl+shift+[ Utterance First Word End
    if (event.ctrlKey && event.shiftKey && event.which === 219) {
      event.preventDefault();
      updateFieldOnShortCutPress(
        $('#first-word-minute'),
        $('#first-word-seconds'),
        $('#first-word-milliseconds')
      );
    }

    //Ctrl+shift+] Utterance First Word Display End
    if (event.ctrlKey && event.shiftKey && event.which === 221) {
      event.preventDefault();
      updateFieldOnShortCutPress(
        $('#first-word-display-end-minute'),
        $('#first-word-display-end-seconds'),
        $('#first-word-display-end-milliseconds')
      );
    }

    //ctrl+shift+f Final Text Display
    if (event.ctrlKey && event.shiftKey && event.which === 70) {
      event.preventDefault();
      updateFieldOnShortCutPress(
        $('#final-text-minute'),
        $('#final-text-seconds'),
        $('#final-text-milliseconds')
      );
    }
    */

    //Ctrl+shift+[ wake-word-start
    if (event.ctrlKey && event.shiftKey && event.which === 219) {
      event.preventDefault();
      updateFieldOnShortCutPress(
        $('#wake-word-start-minute'),
        $('#wake-word-start-seconds'),
        $('#wake-word-start-milliseconds')
      );
    }

    //Ctrl+shift+] wake-word-end
    if (event.ctrlKey && event.shiftKey && event.which === 221) {
      event.preventDefault();
      updateFieldOnShortCutPress(
        $('#wake-word-end-minute'),
        $('#wake-word-end-seconds'),
        $('#wake-word-end-milliseconds')
      );
    }

    //ctrl+shift+, Command Start
    if (event.ctrlKey && event.shiftKey && event.which === 188) {
      event.preventDefault();
      updateFieldOnShortCutPress(
        $('#command-start-minute'),
        $('#command-start-seconds'),
        $('#command-start-milliseconds')
      );
    }

    //ctrl+shift+. Utterance Display End
    if (event.ctrlKey && event.shiftKey && event.which === 190) {
      event.preventDefault();
      updateFieldOnShortCutPress(
        $('#start-of-assistant-minute'),
        $('#start-of-assistant-seconds'),
        $('#start-of-assistant-milliseconds')
      );
    }

    //Ctrl+alt+[ Repeat Wake word start to end
    if (event.altKey && event.shiftKey && event.which === 219) {
      event.preventDefault();
      repeatMarker(
        parseAnnotationTime(
          $('#wake-word-start-minute').val(),
          $('#wake-word-start-seconds').val(),
          $('#wake-word-start-milliseconds').val()
        ),
        parseAnnotationTime(
          $('#wake-word-end-minute').val(),
          $('#wake-word-end-seconds').val(),
          $('#wake-word-end-milliseconds').val()
        )
      );
    }

    //Ctrl+alt+[ Repeat Wake word start to end
    if (event.altKey && event.shiftKey && event.which === 188) {
      event.preventDefault();
      repeatMarker(
        parseAnnotationTime(
          $('#command-start-minute').val(),
          $('#command-start-seconds').val(),
          $('#command-start-milliseconds').val()
        ),
        parseAnnotationTime(
          $('#annotation-end-minute').val(),
          $('#annotation-end-seconds').val(),
          $('#annotation-end-milliseconds').val()
        )
      );
    }
  });
}
