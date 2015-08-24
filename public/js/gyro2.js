;(function($) {

var $body = $('body');
  function deviceOrientationHandler(tiltLR, tiltFB, dir) {
    /*
    document.getElementById("doTiltLR").innerHTML = Math.round(tiltLR);
    document.getElementById("doTiltFB").innerHTML = Math.round(tiltFB);
    document.getElementById("doDirection").innerHTML = Math.round(dir);
    */
    
    // Apply the transform to the image
    /*
    var logo = document.getElementById("remote");
    logo.style.webkitTransform = "rotate("+ tiltLR +"deg) rotate3d(1,0,0, "+ (tiltFB*-1)+"deg)";
    logo.style.MozTransform = "rotate("+ tiltLR +"deg)";
    logo.style.transform = "rotate("+ tiltLR +"deg) rotate3d(1,0,0, "+ (tiltFB*-1)+"deg)";
    */

    //send event notifying about tilt
    var data = {
      tiltLR: tiltLR,
      tiltFB: tiltFB,
      dir: dir
    }
    $body.trigger('tiltchange.gyro', data);

  }

  function init() {

    if (window.DeviceOrientationEvent) {
      // Listen for the deviceorientation event and handle the raw data
      window.addEventListener('deviceorientation', function(eventData) {
        // gamma is the left-to-right tilt in degrees, where right is positive
        var tiltLR = eventData.gamma;
        
        // beta is the front-to-back tilt in degrees, where front is positive
        var tiltFB = eventData.beta;
        
        // alpha is the compass direction the device is facing in degrees
        var dir = eventData.alpha;
        
        // call our orientation event handler
        deviceOrientationHandler(tiltLR, tiltFB, dir);
        }, false);

    } else {
      console.log('deviceOrientationEvent not supported');
    }
  }

  $(document).ready(init);

})(jQuery);