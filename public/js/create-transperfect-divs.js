function createTransperfectSegments(
  segmentId,
  segmentStart,
  segmentEnd,
  annotationText,
  finalTextDisplay,
  iteration,
  micActivationAttempt,
  micClose,
  micOpen,
  micTap,
  promptId,
  take,
  utteranceDisplayStart,
  utteranceDisplayEnd,
  utteranceEnd,
  utteranceFirstWordEnd,
  utteranceFirstWordDisplayEnd,
  utteranceStart,
  utteranceText,
  actual = false
) {
  var leftSpeakerCategoryDivMargin = 120;
  //leftMargin =400;
  //declaring the add region bool true to allow adding regions
  addRegionBool = true;
  var leftMargin = canvasHeight - 8;
  var div = document.createElement('div');
  //div.style.marginTop="450px";
  div.id = segmentId;

  div.className = 'speaker';
  div.title = 'speaker';
  var p = document.createElement('p');
  var colorArr = ['#f5d98c', '#f29363', '#b4ede9', '#a1edbc'];
  var neededColor = getRandomColor();
  div.style.height = '180px';

  //Transperfect Data Sets
  setDataAttributes(
    div,
    segmentStart,
    segmentEnd,
    finalTextDisplay,
    iteration,
    micActivationAttempt,
    micClose,
    micOpen,
    micTap,
    promptId,
    take,
    utteranceDisplayStart,
    utteranceDisplayEnd,
    utteranceFirstWordEnd,
    utteranceFirstWordDisplayEnd,
    utteranceText,
    annotationText
  );

  //if it is actual data from database, display correct or incorrect
  if (actual) {
    if (correctSegmentCreated) {
      div.style.border = `3.5px dashed #05f234`;
      div.style.opacity = '0.4';
    } else {
      div.style.border = `3.5px dashed #ff0a0e`;
      div.style.opacity = '0.4';
    }
  }
  //div.style.boxShadow = "1px 1px 5px";
  div.style.background = neededColor;
  div.style.overflow = 'hidden';
  div.style.zIndex = zindexLoop + 1;
  p.innerHTML = annotationText;

  p.style.transform = 'translateX(0%) rotate(270deg)';
  p.style.width = '150px';
  p.style.height = '140px';
  p.style.padding = '5px';
  p.style.fontSize = '16px';
  p.style.pointerEvents = 'none';
  p.style.wordBreak = 'break-word';
  p.style.fontFamily = 'Arial, Helvetica, sans-serif';
  div.appendChild(p);
  div.style.position = 'absolute';
  //div.style.top = "0px";
  var progress1 = segmentStart / spectrum.getDuration();
  var progress2 = (segmentEnd - segmentStart) / spectrum.getDuration();
  var minPxDelta = 1 / spectrum.params.pixelRatio;
  var pos = Math.round(progress1 * spectrum.drawer.getWidth()) * minPxDelta;
  var pos1 =
    Math.round(progress2 * spectrum.drawer.getWidth()) * minPxDelta - 3;

  div.style.left = pos + 'px';
  div.style.width = pos1 + 'px';

  //onClick and onChange action listener
  div.addEventListener('click', changeAnnotationOnClick);

  if ($('#peaks-container').children().hasClass('speaker')) {
    $('#annotation-div')
      .children()
      .each(function (index, value) {
        if (value.className === 'speaker') {
          div.style.background = value.style.backgroundColor;
          div.style.bottom =
            leftMargin + leftSpeakerCategoryDivMargin * index + 'px';
          div.style.height = '180px';
          $('#peaks-container').append(div);
          return false;
        }
      });
  } else {
    //var topValue=$("#peaks-container").find("."+segmentClass.replace(" ","-")).position().top;
    div.style.bottom =
      leftMargin +
      leftSpeakerCategoryDivMargin *
        $('#annotation-div').children('div').length +
      'px';
    div.style.height = '180px';
    $('#peaks-container').append(div);
    topSpeakerDiv('speaker', neededColor);
  }
} //function createDiv end

function setDataAttributes(
  div,
  segmentStart,
  segmentEnd,
  finalTextDisplay,
  iteration,
  micActivationAttempt,
  micClose,
  micOpen,
  micTap,
  promptId,
  take,
  utteranceDisplayStart,
  utteranceDisplayEnd,
  utteranceFirstWordEnd,
  utteranceFirstWordDisplayEnd,
  utteranceText,
  annotationText
) {
  //Transperfect Data Sets
  div.dataset.finalTextDisplay = finalTextDisplay;
  div.dataset.iteration = iteration;
  div.dataset.micActivationAttempt = micActivationAttempt;
  div.dataset.micClose = micClose;
  div.dataset.micOpen = micOpen;
  div.dataset.micTap = micTap;
  div.dataset.promptId = promptId;
  div.dataset.take = take;
  div.dataset.utteranceDisplayStart = utteranceDisplayStart;
  div.dataset.utteranceDisplayEnd = utteranceDisplayEnd;
  div.dataset.utteranceEnd = segmentEnd;
  div.dataset.utteranceFirstWordEnd = utteranceFirstWordEnd;
  div.dataset.utteranceFirstWordDisplayEnd = utteranceFirstWordDisplayEnd;
  div.dataset.utteranceStart = segmentStart;
  div.dataset.utteranceText = utteranceText;
  div.dataset.actualText = annotationText;
}
