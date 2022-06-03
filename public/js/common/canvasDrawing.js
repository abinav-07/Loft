function canvasStraightLine() {
  //Creating a Canvas straight Line
  var canvas = $('#peaks-container > wave canvas');
  var newCanvas = document.createElement('canvas');
  newCanvas.width = '2000';
  newCanvas.height = '316';
  newCanvas.style.cssText =
    'position: absolute; z-index: 2; left: -2000px; bottom: 0px; height: 35.5%; pointer-events: none; width: 2000px;';
  canvas[0].before(newCanvas);
  canvas = $('#peaks-container > wave canvas');
  for (var i = 0; i < canvas.length; i++) {
    var context = canvas[i].getContext('2d');
    var x = canvas[i].width;
    var y = canvas[i].height / 2;

    context.beginPath();
    // Staring point (10,45)
    context.moveTo(0, y);
    // End point (180,47)
    context.lineTo(x, y);
    // Make the line visible
    context.strokeStyle = '#000';
    context.lineWidth = 1;
    context.stroke();
  } //Canvas Creation End
}
