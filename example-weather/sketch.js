let input, button, loc="new york";
let readings = new Array(40).fill(0);
function setup() {
  // put setup code here
  createCanvas(720, 720);

  // creating a text input for location submission
  input = createInput();
  input.position(20, 20);

  button = createButton('update');
  button.position(input.x + input.width + 8, input.y);
  button.mousePressed(updateLocationData);

  //fill(51);
  updateLocationData();
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
      readings[i] = res.list[i].main.temp - 272.15;//inline converting kelvin to celsius
    }
    console.log(readings);
    drawImg();
  }

  // Send request
  request.send();
}

function reMap(val) {
  var OldRange = (40 - (-20));
  var NewRange = (140 - 10);
  return (((val - (-20)) * NewRange) / OldRange) + 10;
}

function tempZone(val) {
  if (val>=30) {
    //too hot :o
    fill('#D6202A');
  }
  else if(val>20) {
    // just right :)
    fill('#FF8833');
  }
  else if(val>10) {
    // chilly :s
    fill('#5BA049');
  }
  else if(val>-10) {
    // cold :x
    fill('#15ABDD');
  }
  else {
    // *ice*
    fill('#0454AE');
  }
  noStroke();
}

function drawImg() {
  background(255);
  // put drawing code here
  //console.log(readings);
  var ctr = 0;
  for (var r=(height/6); r<height; r+=height/6) {
    for (var c=(width/8); c<width; c+=width/8) {
      //circle( c, r, 10);
      var d = reMap(readings[ctr]);
      //console.log(d);
      tempZone(d);
      circle( c, r, d);
      ctr++;
    }
  }
}
