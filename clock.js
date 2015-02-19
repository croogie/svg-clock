function Clock(svgId, offset, minute, second, size, absOffset) {
  "use strict";

  // Setup clock face
  this.s = new Snap("#" + svgId);

  // Set defaults
  this.showSeconds = true;
  this.offset = 0;
  this.hour = 0;
  this.minute = 0;
  this.second = 0;
  this.movement = "normal";
  this.size = 300;

  this.clockStrokeWidth = 2;
  this.clockPointsStrokeWidth = 1;
  this.clockStrokeColor = '#fff';
  this.clockBackground = "transparent";
  this.centerSize = 3;
  this.absOffset = false;

  // if offset is an object it'll hold the configuration settings
  if (offset !== null && typeof offset === "object") {
    var options = offset;
    
    if ("movement" in options) {
      if (options.movement === "bounce") {
        this.movement = "bounce";
      }
    }
    if ("showSeconds" in options) {
      this.showSeconds = options.showSeconds;
    }
    if ("offset" in options) {
      this.offset = options.offset;
      
    } else if ("hours" in options || "minutes" in options || "seconds" in options) {
      if ("hours" in options) {
        this.hour = options.hours;
      }
      if ("minutes" in options) {
        this.minute = options.minutes;
      }
      if ("seconds" in options) {
        this.second = options.seconds;
      }
    }

    if ("size" in options){
      this.size = options.size;
    }
    if ("absOffset" in options){
      this.absOffset = options.absOffset;
    }

  // else use parameters for configuration settings
  } else {
    // Set time or offset?
    if (minute !== undefined) {
      // Set time
      this.hour = offset;
      this.minute = minute;
      if (second !== undefined) {
        this.second = second;
      } else {
        this.second = 0;
      }
    } else if (offset !== undefined) {
      // Set offset
      this.offset = offset;
      
    };

    if (size !== undefined){
      this.size = size;
    }
  }

  // Set up clock
  this.updateTime();
  this.drawClockFace();
}

Clock.prototype.hideSecondHand = function() {
  this.showSeconds = false;
  this.secondHand.remove();
};

Clock.prototype.drawClockFace = function() {
  var clockFace = this.s.circle(this.size/2, this.size/2, this.size/3);

  clockFace.attr({
    fill: this.clockBackground,
      stroke: this.clockStrokeColor,
      strokeWidth: this.clockStrokeWidth
  });

  // Draw hours
  for (var x=1;x<=12;x++) {
      var hourStroke = this.s.line(this.size/2,this.size/5,this.size/2,4*this.size/15);
      hourStroke.attr({
        stroke: this.clockStrokeColor,
        strokeWidth: this.clockPointsStrokeWidth
      });

      var t = new Snap.Matrix();
      t.rotate((360/12)*x, this.size/2, this.size/2);
      hourStroke.transform(t);
  }

  this.hourHand = this.s.line(this.size/2,this.size/2,this.size/2,this.size/3);
  this.hourHand.attr({
    stroke: this.clockStrokeColor,
    strokeWidth: this.clockStrokeWidth
  });

  this.minuteHand = this.s.line(this.size/2,this.size/2,this.size/2,this.size/5);
  this.minuteHand.attr({
    stroke: this.clockStrokeColor,
    strokeWidth: this.clockStrokeWidth
  });

  if (this.showSeconds) {
    this.secondHand = this.s.line(this.size/2,this.size/2,this.size/2,this.size/5);
    this.secondHand.attr({
      stroke: this.clockStrokeColor,
      strokeWidth: this.clockPointsStrokeWidth
    });
  }

  // Centre point
  var clockCenter = this.s.circle(this.size/2, this.size/2, this.centerSize);
  clockCenter.attr({
    fill: this.clockStrokeColor
  });

  // Set initial location of hands
  if (this.showSeconds) {
    var s = new Snap.Matrix();
    s.rotate(this.getSecondDegree(this.second), this.size/2, this.size/2);
    this.secondHand.transform(s);
  }
  
  var h = new Snap.Matrix();
  h.rotate(this.getHourDegree(this.hour, this.minute), this.size/2, this.size/2);
  this.hourHand.transform(h);

  var m = new Snap.Matrix();
  m.rotate(this.getMinuteDegree(this.minute), this.size/2, this.size/2);
  this.minuteHand.transform(m);
};

Clock.prototype.updateTime = function() {
  // Get time
  var now = new Date();

  // Do we have an offset?
  this.hour = now.getHours();
  this.hour += this.offset;

  // Do we have absolute offset?
  if (this.absOffset) {
    absOffset = now.getTimezoneOffset()/60;
    this.hour += absOffset;
    
  };

  // Normalise hours to 1-12
  if (this.hour > 23) {
    this.hour = this.hour - 24;
  } else if (this.hour < 0) {
    this.hour = 24 + this.hour;
  }
  if (this.hour > 12) {
    this.hour -= 12;
  }
  this.minute = now.getMinutes();
  this.second = now.getSeconds();

};

Clock.prototype.animateHands = function() {
  this.updateTime();

  // Move second hand
  if (this.showSeconds) {
    var s = new Snap.Matrix();
    s.rotate(this.getSecondDegree(this.second), this.size/2, this.size/2);
    if (this.movement === "bounce") {
      this.secondHand.animate({transform: s}, 400, mina.bounce);
    } else {
      this.secondHand.animate({transform: s}, 100);
    }
  }

  // Move hour & minute?
  if (this.second === 0) {
    var h = new Snap.Matrix();
    h.rotate(this.getHourDegree(this.hour, this.minute), this.size/2, this.size/2);
    if (this.movement === "bounce") {
      this.hourHand.animate({transform: h}, 400, mina.bounce);
    } else {
      this.hourHand.animate({transform: h}, 100);
    }

    var m = new Snap.Matrix();
    m.rotate(this.getMinuteDegree(this.minute), this.size/2, this.size/2);
    if (this.movement === "bounce") {
      this.minuteHand.animate({transform: m}, 400, mina.bounce);
    } else {
      this.minuteHand.animate({transform: m}, 100);
    }
  }
};

Clock.prototype.getSecondDegree = function(second) {
  return (360/60) * second;
};

Clock.prototype.getMinuteDegree = function(minute) {
  return (360/60) * minute;
};

Clock.prototype.getHourDegree = function(hour, minute) {
  var increment = Math.round((30/60) * minute);
  return ((360/12) * hour) + increment;
};

Clock.prototype.startClock = function() {
  // Update clock every second
  var instance = this;
  this.timeoutId = setInterval(function(){
    instance.animateHands();
  }, 1000);
};

Clock.prototype.stopClock = function() {
  clearTimeout(this.timeoutId);
};