//Wavesurfer play pause
function playPauseAudio() {
  var playing = spectrum.isPlaying();
  if (!playing) {
    spectrum.play();
    $('#play-button').find($('.fa')).toggleClass('fa-play fa-pause');
  } else {
    spectrum.pause();
    $('#play-button').find($('.fa')).toggleClass('fa-pause fa-play');
  }
  return playing;
}

function pauseAudio() {
  if (spectrum.isPlaying()) {
    spectrum.pause();
    $('#play-button').find($('.fa')).toggleClass('fa-pause fa-play');
  }
}

//function to display the textarea and speakerfield
function displayArea() {
  var val = document.getElementById('annotation-type');
  if (val.value !== 'default' && val.value !== 'Singing') {
    document.getElementById('speaker-name').value = val.value;
    document.getElementById('transcription-area').value = '';
    document.getElementById('transcription-area').style.display = 'none';
    document.getElementById('speaker-name').style.display = 'none';
  } else {
    document.getElementById('transcription-area').style.display = 'block';
    document.getElementById('speaker-name').style.display = 'block';
  }
}

//function to set cookie for current time stamp
function setCookie(cookieName, cookieValue, expireDays) {
  var date = new Date();
  date.setTime(date.getTime() + expireDays * 24 * 60 * 60 * 1000);
  var expires = 'expires=' + date.toUTCString();
  document.cookie = cookieName + '=' + cookieValue + ';' + expires + ';path=/';
}

//Set Current Time Stamp to cookie every 5 sec
$(document).ready(function () {
  setInterval(() => {
    if (spectrum.getCurrentTime() > 0) {
      setCookie(
        'current_time',
        `${spectrum.getCurrentTime() / spectrum.getDuration()}`,
        30
      );
    }
  }, 5000);
});

function parseAnnotationTime(minute, second, millisecond) {
  const value = parseInt(minute * 60) + parseInt(second) + '.' + millisecond;
  return value;
}

//function to get cookie for currentTime Stamp
function getCookie(cookieName) {
  var name = cookieName + '=';
  var decodedCookie = decodeURIComponent(document.cookie);
  var cookieArray = decodedCookie.split(';');
  for (var i = 0; i < cookieArray.length; i++) {
    var cookie = cookieArray[i];
    while (cookie.charAt(0) == ' ') {
      cookie = cookie.substring(1);
    }
    if (cookie.indexOf(name) == 0) {
      return cookie.substring(name.length, cookie.length);
    }
  }
  return '';
}

//function to seek to set cookie
function seekToCookie() {
  //Load Wave to previous time stamp from cookie
  setTimeout(function () {
    if (
      getCookie('current_time') > 0 &&
      $('#peaks-container').children('div').length > 1
    ) {
      spectrum.seekTo(parseFloat(getCookie('current_time')));
      updateTimer();
      //spectrum.seekTo(0.0404);
    }
  }, 1500);
}

//Update Timer Display
function updateTimer() {
  var formatTime = secondsToTimestamp(spectrum.getCurrentTime());
  document.getElementById('start-timestamp').innerText = formatTime;
  document.getElementById('start-time-hour').innerText = secondsToHours(
    spectrum.getCurrentTime()
  );
}

//Add New Region
function addRegion() {
  //show annotation box
  if (!updateTopDivSpeaker) {
    $('#top-div-speaker-control').hide();
    $('#annotation-box').show();
  }

  /*
      Boolean to whether create new segment or delete previous new region and create new segment again
      Two New Segments Cannot Be Created
    */

  if (addRegionBool == true) {
    if (!updateAnnotationOnChange && !updateTopDivSpeaker) {
      renew(); //Renew Annotation Box
      updateSegments = false;
      addRegionBool = false;
      segmentEnd = spectrum.getCurrentTime();
      if (spectrum.getCurrentTime() - 2 < 0) {
        segmentStart = 0;
      } else {
        segmentStart = segmentEnd - 2;
      }

      spectrum.addRegion({
        id: segmentId,
        start: segmentStart,
        end: segmentEnd,
        drag: false,
        color: 'rgba(0,0,0,0)',
      });
      currentId = segmentId;
      //highlighting current Region
      highlightRegion();

      //segment start variables
      var startMinute = secondsToMinutes(
        spectrum.regions.list[currentId].start
      );
      var startSeconds = secondsToSeconds(
        spectrum.regions.list[currentId].start
      );
      var startMilliseconds = secondsToMilliseconds(
        spectrum.regions.list[currentId].start
      );

      //segment end variables
      var endMinute = secondsToMinutes(spectrum.regions.list[currentId].end);
      var endSeconds = secondsToSeconds(spectrum.regions.list[currentId].end);
      var endMilliseconds = secondsToMilliseconds(
        spectrum.regions.list[currentId].end
      );

      //displaying texts
      $('#annotation-start-minute').val(startMinute);
      $('#annotation-start-seconds').val(startSeconds);
      $('#annotation-start-milliseconds').val(startMilliseconds);
      $('#annotation-end-minute').val(endMinute);
      $('#annotation-end-seconds').val(endSeconds);
      $('#annotation-end-milliseconds').val(endMilliseconds);

      if (isTransperfect) {
        $('#wake-word-start-minute').val(startMinute);
        $('#wake-word-start-seconds').val(startSeconds);
        $('#wake-word-start-milliseconds').val(startMilliseconds);
      }
    }
  } else {
    if (!updateAnnotationOnChange && !updateTopDivSpeaker) {
      spectrum.regions.list[segmentId].remove();
      updateSegments = true;
      addRegionBool = true;
      addRegion();
    }
  }

  spectrum.on('seek', function () {
    if (
      !updateTopDivSpeakerOnClick &&
      !updateTopDivSpeaker &&
      !updateAnnotationOnChange &&
      !updateAnnotationOnClick &&
      spectrum.regions.list[segmentId] != null
    ) {
      spectrum.regions.list[segmentId].remove();
      updateSegments = true;
      addRegionBool = true;
    }
  });
} //function addRegion end

//function to convert seconds to minute, seconds and milliseconds
function secondsToTimestamp(seconds) {
  var n = Math.floor(seconds);
  var ms = (seconds - n).toFixed(3);

  seconds = Math.floor(seconds);
  var h = Math.floor(seconds / 3600);
  var m = Math.floor((seconds - h * 3600) / 60);
  var s = Math.ceil(seconds) - h * 3600 - m * 60;

  m = m < 10 ? '0' + m : m;
  s = s < 10 ? '0' + s : s;
  ms = ms < 10 ? '0' + ms : ms;

  return m + ':' + s + '.' + ms.split('.')[1];
}

function secondsToHours(seconds) {
  seconds = Math.floor(seconds);
  var h = Math.floor(seconds / 3600);

  h = h < 10 ? '0' + h : h;

  return h;
}

//function to convert seconds to minute for editing annotation box
function secondsToMinutes(seconds) {
  var h = Math.floor(seconds / 3600);
  var m = Math.floor((seconds - h * 3600) / 60);
  m = m < 10 ? '0' + m : m;
  return m;
}

//function to convert seconds to seconds for editing annotation box
function secondsToSeconds(seconds) {
  seconds = Math.floor(seconds);
  var h = Math.floor(seconds / 3600);
  var m = Math.floor((seconds - h * 3600) / 60);
  var s = seconds - h * 3600 - m * 60;
  s = s < 10 ? '0' + s : s;
  return s;
}

//function to convert seconds to milliseconds for editing annotation box
function secondsToMilliseconds(seconds) {
  var n = Math.floor(seconds);
  var ms = (seconds - n).toFixed(3);
  ms = ms < 10 ? '0' + ms : ms;
  return ms.split('.')[1];
}

function removeTopDivSpeakers(topSpeakerClickedId) {
  //Getting the clicked Top Div Class
  var getClickedIdClass =
    document.getElementById(topSpeakerClickedId).className;
  //Checking if the segments of the class still remain
  if ($('#peaks-container').children().hasClass(getClickedIdClass)) {
    topSpeakerRemoveDialougeBox();
  } else {
    //Removing top div
    $('#' + topSpeakerClickedId).remove();
    $('#top-div-speaker-control').hide();
    updateTopDivSpeakerOnClick = false;
    updateTopDivSpeaker = false;
  }
}

function navigateTurnsFirstButton(topSpeakerClickedId, spectrum) {
  var getClickedIdClass =
    document.getElementById(topSpeakerClickedId).className;
  if ($('#peaks-container').children().hasClass(getClickedIdClass)) {
    var firstSegmentId = $(`#peaks-container .${getClickedIdClass}`)[0].id;
    var firstSegmentStartTime = spectrum.regions.list[firstSegmentId].start;
    spectrum.seekTo(firstSegmentStartTime / spectrum.getDuration());
  }
}

function navigateTurnsLastButton(topSpeakerClickedId, spectrum) {
  var getClickedIdClass =
    document.getElementById(topSpeakerClickedId).className;
  if ($('#peaks-container').children().hasClass(getClickedIdClass)) {
    var lastSegmentId = $(`#peaks-container .${getClickedIdClass}`)[
      $(`#peaks-container .${getClickedIdClass}`).length - 1
    ].id;

    var lastSegmentStartTime = spectrum.regions.list[lastSegmentId].start;
    spectrum.seekTo(lastSegmentStartTime / spectrum.getDuration());
  }
}

//colorPicker
function getRandomColor() {
  var hue = Math.floor(Math.random() * 360);

  return `hsl(${hue},100%,90%)`;
}

//function to update Segment Start on start time change
function updateSegmentonTimeChange() {
  // if (updateSegments) {
  updateAnnotationOnChange = true;
  var starting =
    parseInt($('#annotation-start-minute').val() * 60) +
    parseInt($('#annotation-start-seconds').val()) +
    '.' +
    $('#annotation-start-milliseconds').val();
  var ending =
    parseInt($('#annotation-end-minute').val() * 60) +
    parseInt($('#annotation-end-seconds').val()) +
    '.' +
    $('#annotation-end-milliseconds').val();

  if (spectrum.regions.list[currentId] != null) {
    if (
      parseFloat(ending) - parseFloat(starting) < 0.1 &&
      parseFloat(ending) - parseFloat(starting) >= 0
    ) {
      spectrum.regions.list[currentId].update({
        start: starting, //-0.050,
        end: parseFloat(ending) + 0.01, //+900
      });
      hundredMillisecSegmentCheck = false;
      segmentEndingTimeMoreThanStartingTime = false;
    } else if (parseFloat(ending) - parseFloat(starting) < 0) {
      spectrum.regions.list[currentId].update({
        end: starting,
        start: ending,
      });
      hundredMillisecSegmentCheck = true;
      segmentEndingTimeMoreThanStartingTime = true;
    } else {
      spectrum.regions.list[currentId].update({
        start:
          parseInt($('#annotation-start-minute').val() * 60) +
          parseInt($('#annotation-start-seconds').val()) +
          '.' +
          $('#annotation-start-milliseconds').val(),
        end:
          parseInt($('#annotation-end-minute').val() * 60) +
          parseInt($('#annotation-end-seconds').val()) +
          '.' +
          $('#annotation-end-milliseconds').val(),
      });
      hundredMillisecSegmentCheck = true;
      segmentEndingTimeMoreThanStartingTime = false;
    }

    //highlight clicked region
    highlightRegion();

    newStartTime = spectrum.regions.list[currentId].start;
    newEndTime = spectrum.regions.list[currentId].end;

    var progress1 = newStartTime / spectrum.getDuration();
    var progress2 = (newEndTime - newStartTime) / spectrum.getDuration();
    var minPxDelta = 1 / spectrum.params.pixelRatio;
    var pos = Math.round(progress1 * spectrum.drawer.getWidth()) * minPxDelta;
    var pos1 = Math.round(progress2 * spectrum.drawer.getWidth()) * minPxDelta;

    if (
      $('#peaks-container')
        .children()
        .is('#' + currentId)
    ) {
      document.getElementById(currentId).style.left = pos + 'px';
      document.getElementById(currentId).style.width = pos1 + 'px';
    }

    //Change start and end on change
    segmentStart = spectrum.regions.list[currentId].start;
    segmentEnd = spectrum.regions.list[currentId].end;
  }
} //Update Segment On Change End

//function to display top div speakers on click
function displayTopDivSpeakersControls(speakerName) {
  if (!updateAnnotationOnChange) {
    $('#annotation-box').hide();
    $('#top-div-speaker-control').show();
    $('#top-div-control-speaker-name').val(speakerName);
  }
}

function changeTopSpeakerDivControlOnClick(event) {
  if (!updateAnnotationOnChange && !updateTopDivSpeaker) {
    getTopClickedId = event.target.id;
    var getTopClickedClass = document
      .getElementById(getTopClickedId)
      .className.replace(/-/g, ' ');

    displayTopDivSpeakersControls(getTopClickedClass);
  }
}

//function to highlight current region
function highlightRegion() {
  var highlightId = currentId;

  Object.keys(spectrum.regions.list).forEach(function (id) {
    var region = spectrum.regions.list[id];
    if (region.id == highlightId) {
      region.element.children[0].style.backgroundColor = 'rgba(94, 196, 247,1)';
      region.element.children[1].style.backgroundColor = 'rgba(94, 196, 247,1)';
      region.element.style.backgroundColor = 'rgba(168,221,227,0.6)';
      if (
        $('#peaks-container')
          .children()
          .is('#' + highlightId)
      ) {
        document.getElementById(highlightId).style.boxShadow =
          '0.5px 0.5px 3px';
      }
    } else {
      region.element.children[0].style.backgroundColor = 'rgba(0,0,0,0)';
      region.element.children[1].style.backgroundColor = 'rgba(0,0,0,0)';
      region.element.style.backgroundColor = 'rgba(0,0,0,0)';
      if (
        $('#peaks-container')
          .children()
          .is('#' + region.id)
      ) {
        document.getElementById(region.id).style.boxShadow = '0.8px 0.8px 2px';
      }
    }
  });
} //Highlight Region End

//function for confirming changes on close click
function discardChanges() {
  //if changes were made in annotation box
  if (updateAnnotationOnChange) {
    $('#annotation-box').hide();
    updateAnnotationOnChange = false;
    if (
      $('#peaks-container')
        .children()
        .is('#' + currentId)
    ) {
      spectrum.regions.list[currentId].update({
        start: currentStartTime,
        end: currentEndTime,
      });

      //segment start variables
      var startMinute = secondsToMinutes(
        spectrum.regions.list[currentId].start
      );
      var startSeconds = secondsToSeconds(
        spectrum.regions.list[currentId].start
      );
      var startMilliseconds = secondsToMilliseconds(
        spectrum.regions.list[currentId].start
      );

      //segment end variables
      var endMinute = secondsToMinutes(spectrum.regions.list[currentId].end);
      var endSeconds = secondsToSeconds(spectrum.regions.list[currentId].end);
      var endMilliseconds = secondsToMilliseconds(
        spectrum.regions.list[currentId].end
      );

      //displaying texts
      $('#annotation-start-minute').val(startMinute);
      $('#annotation-start-seconds').val(startSeconds);
      $('#annotation-start-milliseconds').val(startMilliseconds);
      $('#annotation-end-minute').val(endMinute);
      $('#annotation-end-seconds').val(endSeconds);
      $('#annotation-end-milliseconds').val(endMilliseconds);

      var progress1 = currentStartTime / spectrum.getDuration();
      var progress2 =
        (currentEndTime - currentStartTime) / spectrum.getDuration();
      var minPxDelta = 1 / spectrum.params.pixelRatio;
      var pos = Math.round(progress1 * spectrum.drawer.getWidth()) * minPxDelta;
      var pos1 =
        Math.round(progress2 * spectrum.drawer.getWidth()) * minPxDelta;

      document.getElementById(currentId).style.left = pos + 'px';
      document.getElementById(currentId).style.width = pos1 + 'px';
    } else {
      if (spectrum.regions.list[currentId]) {
        spectrum.regions.list[currentId].remove();
      }
    }
  } else if (updateTopDivSpeaker) {
    //Hiding Annotation Div
    $('#top-div-speaker-control').hide();
    updateTopDivSpeaker = false;
  }
}

//Function to create a cancel confirm Dialogue Box
function confirmDialogue() {
  $('#confirmation-box').show();
  $('body').not('#confirmation-box').css({
    backgroundColor: '#d9dedb',
    opacity: '0.8',
  });
}

//Function to Display Errors and hamburger icons
function displayHamburger() {
  $('#errorToggle').show();
  $('#speaker-labelling-error').text(
    `Speaker Labelling Error: ` + wrongSpeakerScore
  );
  $('#annotation-labelling-error').text(
    `Annotation Labelling Error: ` + wrongAnnotationScore
  );
  $('#unnecessary-segments-errors').text(
    `Unnecessary Segments Error: ` + unnecessarySegmentsErrors
  );
  $('#total-errors').text(`Your Overall Score: ${100 - overallScore}%`);
} //display Hamburger End

//function to disable all on submit
function disableAllInterfaceOnSubmit() {
  $('.disable-all-on-Submit').prop('disabled', true);
  $('.disable-all-on-Submit').css({ cursor: 'not-allowed' });
} //disable all interface on submit end

//function to disable times for transcription
function disableForTranscription() {
  $('.annotation-time-class').prop('disabled', true);
  $('#annotation-remove').prop('disabled', true);
  $('#annotation-remove').css({ cursor: 'not-allowed' });
  $('#annotation-split').prop('disabled', true);
  $('#annotation-split').css({ cursor: 'not-allowed' });
  $('.annotation-time-ms-class').prop('disabled', true);
  $('#annotation-type').prop('disabled', true);
  $('#speaker-name').prop('disabled', true);
  $('#top-div-control-speaker-name').prop('disabled', true);
  $('#top-div-control-remove-button').prop('disabled', true);
  $('#top-div-control-remove-button').css({ cursor: 'not-allowed' });
  $('#top-div-control-save-button').prop('disabled', true);
} //disable times for transcription

//function to skip audio
function skipAudio(timeToSkip) {
  spectrum.skip(timeToSkip);
}

//Function for empty speaker Dialogue Box
function emptySpeaker() {
  $('#empty-speaker').show();
  $('body').not('#empty-speaker').css({
    backgroundColor: '#d9dedb',
    opacity: '0.8',
  });
}

//function for hundredMillisecondsSegmentCheck
function hundredMillisecondsSegmentGap() {
  $('#hundredMilliseconds-gap').show();
  $('body').not('#hundredMilliseconds-gap').css({
    backgroundColor: '#d9dedb',
    opacity: '0.8',
  });
}

//function for Segment End Time More than Start Time
function endTimeMoreThanStartTime() {
  $('#endTime-moreThanStartTime').show();
  $('body').not('#endTime-moreThanStartTime').css({
    backgroundColor: '#d9dedb',
    opacity: '0.8',
  });
}

//function for same Overlapping Speaker Dialogue Box
function sameSpeakerOverlappingDialougeBox() {
  $('#sameSpeaker-Overlapping').show();
  $('body').not('#sameSpeaker-Overlapping').css({
    backgroundColor: '#d9dedb',
    opacity: '0.8',
  });
}

//function for top speaker div remove dialouge box
function topSpeakerRemoveDialougeBox() {
  $('#top-speaker-remove-dialouge-box').show();
  $('body').not('#top-speaker-remove-dialouge-box').css({
    backgroundColor: '#d9dedb',
    opacity: '0.8',
  });
}

//function for ctrl+singlequote for region end time
function ctrlquote() {
  $('html').on('keydown', function (event) {
    if (event.ctrlKey && event.which == 222) {
      event.preventDefault();
      var currentTime = spectrum.getCurrentTime();
      updateAnnotationOnChange = true;
      updateAnnotationOnClick = true;
      //segment end variables
      var endMinute = secondsToMinutes(currentTime);
      var endSeconds = secondsToSeconds(currentTime);
      var endMilliseconds = secondsToMilliseconds(currentTime);

      //displaying texts
      $('#annotation-end-minute').val(endMinute);
      $('#annotation-end-seconds').val(endSeconds);
      $('#annotation-end-milliseconds').val(endMilliseconds);

      var starting =
        parseInt($('#annotation-start-minute').val() * 60) +
        parseInt($('#annotation-start-seconds').val()) +
        '.' +
        $('#annotation-start-milliseconds').val();
      var ending =
        parseInt($('#annotation-end-minute').val() * 60) +
        parseInt($('#annotation-end-seconds').val()) +
        '.' +
        $('#annotation-end-milliseconds').val();

      createSegments(currentId, starting, ending);
    }
  });
}

//function for ctrl+singlequote for region start time
function ctrlcolon() {
  $('html').on('keydown', function (event) {
    if (
      (event.ctrlKey && event.which == 186) ||
      (event.ctrlKey && event.key == ';') ||
      (event.ctrlKey && event.code == 'Semicolon')
    ) {
      event.preventDefault();
      ////console.log("Pressed");
      var currentTime = spectrum.getCurrentTime();
      updateAnnotationOnChange = true;
      updateAnnotationOnClick = true;
      //segment end variables
      //segment start variables
      var startMinute = secondsToMinutes(currentTime);
      var startSeconds = secondsToSeconds(currentTime);
      var startMilliseconds = secondsToMilliseconds(currentTime);

      //displaying texts
      $('#annotation-start-minute').val(startMinute);
      $('#annotation-start-seconds').val(startSeconds);
      $('#annotation-start-milliseconds').val(startMilliseconds);

      var starting =
        parseInt($('#annotation-start-minute').val() * 60) +
        parseInt($('#annotation-start-seconds').val()) +
        '.' +
        $('#annotation-start-milliseconds').val();
      var ending =
        parseInt($('#annotation-end-minute').val() * 60) +
        parseInt($('#annotation-end-seconds').val()) +
        '.' +
        $('#annotation-end-milliseconds').val();

      //Create Segments function call
      createSegments(currentId, starting, ending);
    }
  });
}
