/* this example is adapted from p5js samples:
// The Nature of Code
// Daniel Shiffman
// http://natureofcode.com
 */

//initializing vars
var rows, row_top, row_bot, row_inc, y_inc;

function setup() {
 createCanvas(windowWidth, windowHeight);
 background('#FAFAFA');
 frameRate(1);
 row_top = -100;
 row_bot = 0;
 row_inc = windowHeight*0.05;
 y_inc = random()*0.015 + 50;
 console.log(y_inc);
 rows = 0;
}

function updateLocationData() {
  // todo - fill with openweathermap query
  const name = input.value(); // this is the location/zip etc of the query
  if (name!="") {
    loc = name;
    //console.log("location = "+loc);
  }
  console.log("location = "+loc);

  // Create a request variable and assign a new XMLHttpRequest object to it.
  var request = new XMLHttpRequest();

  // Open a new connection, using the GET request on the URL endpoint
  //request.open('GET', 'http://api.openweathermap.org/data/2.5/forecast?q=London,uk&appid=90c8fa2f8dc20575778cc9f6c3841406', true)
  request.open('GET', 'http://api.openweathermap.org/data/2.5/forecast?q='+loc+'&appid='+APPID, true)
  request.onload = function() {
    // Begin accessing JSON data here
    let res = JSON.parse(this.response);
    console.log(res);
    console.log(res.list[0]);
    for (var i=0; i<res.cnt; i++) {
      readings[i] = res.list[i].wind.speed;
    }
    console.log(readings);

    // todo - reset / create a new wave here? OR update the speed/accel vars
    index = 0;
  }

  // Send request
  request.send();
}

function draw() {

 if(row_bot <= windowHeight) {
   rows++;
   row_top += row_inc;
   row_bot += row_inc;
   y_inc = random()*0.015 + 50;
   console.log(y_inc);
   drawPlot( y_inc, 200, row_top, row_bot)
 }
 else {
   background('#FAFAFA');
   rows = 0;
   row_top = -100;
   row_bot = 0;
   row_inc = 25;
 }
}

function drawPlot(deg_step, samples, top, bot) {

  // curve
  stroke(87, 6, 140);
  fill(226, 225, 221,10);
  beginShape();
  for(var i = 0;i<samples;i++)
  {
    var x = i/(samples-1)*width*0.95+width*0.025;
    var y = map(sin(deg_step*i), -1, 1, bot, top);
    ellipse(x, y, 5, 5);
    vertex(x, y);
  }
  endShape();
}

function windowResized() {
  resizeCanvas(windowWidth,windowHeight);
}
