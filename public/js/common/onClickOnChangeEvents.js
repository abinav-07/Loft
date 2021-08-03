$(function () {
  //Creating a new region on plus button click
  $('#plus-button').on('click', function () {
    if (!updateTopDivSpeaker) {
      addRegion();
    }
  });

  //onClick for close(X) button on Annotation Box
  $('#close').on('click', function () {
    updateSegments = true;
    updateAnnotationOnClick = false;
    updateTopDivSpeakerOnClick = false;
    if (updateAnnotationOnChange) {
      confirmDialogue();
      confirmChangesboxBool = true;
    } else {
      $('#annotation-box').hide();
      addRegionBool = true;
    }
    //current region highlight
    renew();
    highlightRegion();
  });

  //Saving Segments On Save Button Click
  $('#annotation-save').on('click', function () {
    saveClick();
  });

  $('#top-div-control-close-button').on('click', function () {
    if (updateTopDivSpeaker) {
      confirmDialogue();
    } else {
      $('#top-div-speaker-control').hide();
    }
  });

  //Display Correct Training Segments
  function displayCorrectSegment() {
    var selected = $('#select-display-training-segments').val();
    if (selected == 'on') {
      $('#peaks-container')
        .children()
        .each(function (index, value) {
          if (this.getAttribute('actual') == 'true') {
            $(this).show();
          }
        });
    } else if (selected == 'off') {
      $('#peaks-container')
        .children()
        .each(function (index, value) {
          if (this.getAttribute('actual') == 'true') {
            $(this).hide();
          }
        });
    }
  }

  //Display Correct Segments to end Reviewers and end users
  $('#select-display-training-segments').on('change', function () {
    displayCorrectSegment();
  });

  //function for annotation contents change on click
  $(
    '.annotation-time-class, .annotation-time-ms-class, #annotation-type, #speaker-name, #transcription-area'
  ).on('click', function () {
    updateAnnotationOnClick = true;
  });

  //function to check if top div speaker control is clicked
  $('#top-div-control-speaker-name').on('click', function () {
    updateTopDivSpeakerOnClick = true;
  });

  $(
    '.annotation-time-class, .annotation-time-ms-class, #annotation-type, #speaker-name, #transcription-area,#top-div-control-speaker-name'
  ).on('focusout', function () {
    if (updateAnnotationOnClick) {
      updateAnnotationOnClick = false;
    }
    if (updateTopDivSpeakerOnClick) {
      updateTopDivSpeakerOnClick = false;
    }
  });

  $(
    '.annotation-time-class, .annotation-time-ms-class, #annotation-type, #speaker-name, #transcription-area'
  ).on('change', function () {
    updateSegmentonTimeChange();
  });

  $('#top-div-control-speaker-name').on('change', function () {
    updateTopDivSpeaker = true;
  });

  //Repeat a region on repeat icon click
  $('#repeat-button').on('click', function () {
    repeatRegion();
  });

  //function for playBackRate
  function playBackRate(rate) {
    spectrum.setPlaybackRate(rate);
  } //function for playBackRate End

  //function for playback
  $('#play_back_rate').on('click', function () {
    var rate = document.getElementById('play_back_rate').value.split('x');
    playBackRate(parseFloat(rate));
  });

  //function for confirming discard click
  $('.confirm-changes').on('click', function () {
    discardChanges();
    addRegionBool = true;
    confirmChangesboxBool = false;
    $('#confirmation-box').hide();
    $('body').css({
      backgroundColor: '#fff',
      opacity: '1',
    });
  });

  //function to deny changes on close click
  $('.discard-changes').on('click', function () {
    //updateAnnotationOnChange = true;
    confirmChangesboxBool = false;
    $('#confirmation-box').hide();
    $('#empty-speaker').hide();
    $('#hundredMilliseconds-gap').hide();
    $('#endTime-moreThanStartTime').hide();
    $('#sameSpeaker-Overlapping').hide();
    $('#top-speaker-remove-dialouge-box').hide();
    $('body').css({
      backgroundColor: '#fff',
      opacity: '1',
    });
  });

  //Displaying guidelines
  function displayGuideLines() {
    $('#guidelines-box').show();
    $('body').not('#guidelines-box').css({
      backgroundColor: '#d9dedb',
      opacity: '0.8',
    });
  }
  //function for guidelines Box
  $('#help-icon').on('click', function () {
    displayGuideLines();
  });

  $('#close-guidelines').on('click', function () {
    $('#guidelines-box').hide();
    $('body').css({
      backgroundColor: '#fff',
      opacity: '1',
    });
  });

  //clicking in profile link button
  $('#profile-link-button').on('click', () => {
    if (VENDOR_WEBSITE) {
      window.location.href = `${vendor_website_url}/sample#segmentation`;
    } else {
      window.location.href = `${webapp_basepath}/test/segmentation`;
    }
  }); //Profile Link Button function End

  //function to display Errors Menu
  $('#displayErrorCB').on('click', function () {
    if (!$('#displayErrorCB').is(':checked')) {
      $('#errorMenu').not('.showHamburger').show();
      $('.showHamburger').hide();
      $('#closeHamburger').show();
    } else {
      $('#errorMenu').hide();
      $('.showHamburger').show();
      $('#closeHamburger').hide();
    }
  }); //Display Error Menu Close
});
