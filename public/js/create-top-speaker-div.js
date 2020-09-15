  //function to create top speaker annotation divs
  function topSpeakerDiv(segmentClass = "", neededColor) {
      var totalWidth = 0;

      var totalDivs = 1; //$("#annotation-div").has("div").length

      if ($("#annotation-div").children().hasClass(segmentClass.replace(/ /g, "-").toString())) {

      } else {
          var div2 = document.createElement("div");
          var p2 = document.createElement("p");
          div2.className = segmentClass.replace(/ /g, "-");
          div2.id = `top-${segmentClass.replace(/ /g, "-")}`;
          div2.style.backgroundColor = neededColor;
          div2.style.border = `2px groove ${neededColor}`;
          div2.style.boxShadow = "2px 2px 10px";
          p2.innerHTML = segmentClass;
          p2.style.height = "30px";
          p2.style.fontSize = "14px";
          p2.style.margin = "9px";
          div2.style.position = "absolute";
          div2.style.zIndex = "3";
          div2.style.width = "120px";
          div2.style.height = "35px";
          p2.style.pointerEvents = "none";
          div2.appendChild(p2);
          div2.addEventListener("click", changeTopSpeakerDivControlOnClick);
          div2.style.left = ($("#annotation-div").children("div").length) * leftSpeakerCategoryDivMargin + "px";
          if ((($("#annotation-div").children("div").length) * leftSpeakerCategoryDivMargin + leftSpeakerCategoryDivMargin) > $("#annotation-div").width()) {

              leftSpeakerCategoryDivMargin = ($("#annotation-div").width() - leftSpeakerCategoryDivMargin) / $("#annotation-div").children("div").length;
              $("#annotation-div").children().each(function(index, value) {
                  this.style.left = (leftSpeakerCategoryDivMargin * index + "px");
                  //this.style.left = (this.style.left.replace("px","")-20)+"px";
                  div2.style.left = ($("#annotation-div").children("div").length) * leftSpeakerCategoryDivMargin + "px";

                  //Decreasing the width size of segments
                  decreaseDivWidth();
              });
          } else {
              //div2.style.left = ($("#annotation-div").children("div").length) * leftSpeakerCategoryDivMargin + "px";          
          }
          $("#annotation-div").append(div2);
      }
  };

  function decreaseDivWidth() {
      $("#peaks-container").children("div").each(function(index, value) {
          //this.style.left = (leftSpeakerCategoryDivMargin * index + "px");
          //div2.style.left = ($("#annotation-div").children("div").length) * leftSpeakerCategoryDivMargin + "px";            
          this.style.height = (180 + "px");
          if (this.title != "default" && this.title != "Singing") {
              this.style.height = (150 + "px");
          }
      });
  };