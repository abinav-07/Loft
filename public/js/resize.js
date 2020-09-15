function resizeWindow() {

    if (window.matchMedia("(max-width: 1500px)").matches) {
        $("#peaks-container > wave").css({ "height": "65vw" });
        $("#annotation-box").css({
            "box-shadow": "4px 4px 4px #888888",
            "bottom": "3rem",
            "right": "0.1rem",
            "border": "1px solid grey",
            "width": "370px",
            "position": "fixed",
            "z-index": "3",
            "background-color": "white",
            "overflow-x": "hidden",
            "overflow-y": "hidden",
            "display": "none"
        });

        //canvas height to set the top speaker annotation div position from left 
        canvasHeight = $("#peaks-container > wave canvas").height();

        $("#plus-button").css({
            "marginLeft": `65vw`
        })

        $("#submit-button").css({
            "bottom": `0.5rem`
        });
        $("#profile-link-button").css({
            "bottom": `0.5rem`
        })

        $("#plus-button").css({
            "marginTop": `${$("#peaks-container").position().top}px`
        })

        $("#time-line").css({
            "transform": `translate(0px,${$("wave").height() - 10}px)`
        })

        $("#top-div-speaker-control").css({
            "right": "0.1rem",
            "width": "300px"
        });
        //$("#annotation-div-head").css({
        //  "left": `${canvasHeight}px`
        //})


        seekToCookie();

        /* The viewport is less than, or equal to, 1500 pixels wide */
    } else if (window.matchMedia("(min-width: 1500px)").matches) {
        $("#peaks-container > wave").css({ "height": "55vw" });
        $("#annotation-box").css({
            "box-shadow": "4px 4px 4px #888888",
            "bottom": "2rem",
            "right": "10rem",
            "border": "1px solid grey",

            "position": "fixed",
            "z-index": "3",
            "background-color": "white",
            "overflow-x": "hidden",
            "overflow-y": "hidden",
            "display": "none"
        });


        //canvas height to set the top speaker annotation div position from left 
        canvasHeight = $("#peaks-container > wave canvas").height();

        $("#plus-button").css({
            "marginLeft": `56vw`
        })
        $("#submit-button").css({
            "bottom": `2rem`
        });
        $("#profile-link-button").css({
            "bottom": `1rem`
        })
        $("#plus-button").css({
            "marginTop": `${$("#peaks-container").position().top}px`
        })
        $("#time-line").css({
            "transform": `translate(0px,${$("wave").height() - 10}px)`
        });

        $("#top-div-speaker-control").css({
            "right": "2rem",
            "width": "300px"
        });
        seekToCookie();
    }
}