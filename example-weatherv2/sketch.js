/* this example is adapted from p5js samples:
// The Nature of Code
// Daniel Shiffman
// http://natureofcode.com
 */

//initializing vars
let input, button, loc="new york";
let readings = new Array(40).fill(0);
let flock;
let index;

function setup() {
 createCanvas(windowWidth, windowHeight);
 //createP("Drag the mouse to generate new boids.");
 frameRate(60);

 // creating a text input for location submission
 input = createInput();
 input.position(20, 20);

 button = createButton('update');
 button.position(input.x + input.width + 8, input.y);
 button.mousePressed(updateLocationData);

 createNewFlock();

 updateLocationData();
}

function createNewFlock() {
  flock = new Flock();
  // Add an initial set of boids into the system
  for (let i = 0; i < 150; i++) {
    let b = new Boid(width / 2,height / 2);
    flock.addBoid(b);
  }
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
 background(65,105,225,70);
 //fill(#333333, 70);
 //console.log(frameCount);
 if (frameCount%180 ==0) {
   console.log("updating wind speed to reading#..."+index);
   updateWindSpeed(readings[index%40]);
   index++;
 }
 flock.run();
}

function windowResized() {
  resizeCanvas(windowWidth,windowHeight);
}

function updateWindSpeed(spd) {
  console.log(spd+3);
  for (let i = 0; i < flock.boids.length; i++) {
    flock.boids[i].maxspeed = 3 + spd;
  }
}

// Flock object
// Does very little, simply manages the array of all the boids

function Flock() {
 // An array for all the boids
 this.boids = []; // Initialize the array
}

Flock.prototype.run = function() {
 for (let i = 0; i < this.boids.length; i++) {
   this.boids[i].run(this.boids);  // Passing the entire list of boids to each boid individually
 }
}

Flock.prototype.addBoid = function(b) {
 this.boids.push(b);
}

// Boid class
// Methods for Separation, Cohesion, Alignment added

function Boid(x, y) {
 this.acceleration = createVector(0, 0);
 this.velocity = createVector(random(-1, 1), random(-1, 1));
 this.position = createVector(x, y);
 this.r = 3.0;
 this.maxspeed = 3;    // Maximum speed
 this.maxforce = 0.05; // Maximum steering force
}

Boid.prototype.run = function(boids) {
 this.flock(boids);
 this.update();
 this.borders();
 this.render();
}

Boid.prototype.applyForce = function(force) {
 // We could add mass here if we want A = F / M
 this.acceleration.add(force);
}

// We accumulate a new acceleration each time based on three rules
Boid.prototype.flock = function(boids) {
 let sep = this.separate(boids);   // Separation
 let ali = this.align(boids);      // Alignment
 let coh = this.cohesion(boids);   // Cohesion
 // Arbitrarily weight these forces
 sep.mult(1.5);
 ali.mult(1.0);
 coh.mult(1.0);
 // Add the force vectors to acceleration
 this.applyForce(sep);
 this.applyForce(ali);
 this.applyForce(coh);
}

// Method to update location
Boid.prototype.update = function() {
 // Update velocity
 this.velocity.add(this.acceleration);
 // Limit speed
 this.velocity.limit(this.maxspeed);
 this.position.add(this.velocity);
 // Reset accelertion to 0 each cycle
 this.acceleration.mult(0);
}

// A method that calculates and applies a steering force towards a target
// STEER = DESIRED MINUS VELOCITY
Boid.prototype.seek = function(target) {
 let desired = p5.Vector.sub(target,this.position);  // A vector pointing from the location to the target
 // Normalize desired and scale to maximum speed
 desired.normalize();
 desired.mult(this.maxspeed);
 // Steering = Desired minus Velocity
 let steer = p5.Vector.sub(desired,this.velocity);
 steer.limit(this.maxforce);  // Limit to maximum steering force
 return steer;
}

Boid.prototype.render = function() {
 // Draw a triangle rotated in the direction of velocity
 let theta = this.velocity.heading() + radians(90);
 fill(127);
 stroke(200);
 push();
 translate(this.position.x, this.position.y);
 rotate(theta);
 beginShape();
 vertex(0, -this.r * 2);
 vertex(-this.r, this.r * 2);
 vertex(this.r, this.r * 2);
 endShape(CLOSE);
 pop();
}

// Wraparound
Boid.prototype.borders = function() {
 if (this.position.x < -this.r)  this.position.x = width + this.r;
 if (this.position.y < -this.r)  this.position.y = height + this.r;
 if (this.position.x > width + this.r) this.position.x = -this.r;
 if (this.position.y > height + this.r) this.position.y = -this.r;
}

// Separation
// Method checks for nearby boids and steers away
Boid.prototype.separate = function(boids) {
 let desiredseparation = 25.0;
 let steer = createVector(0, 0);
 let count = 0;
 // For every boid in the system, check if it's too close
 for (let i = 0; i < boids.length; i++) {
   let d = p5.Vector.dist(this.position,boids[i].position);
   // If the distance is greater than 0 and less than an arbitrary amount (0 when you are yourself)
   if ((d > 0) && (d < desiredseparation)) {
     // Calculate vector pointing away from neighbor
     let diff = p5.Vector.sub(this.position, boids[i].position);
     diff.normalize();
     diff.div(d);        // Weight by distance
     steer.add(diff);
     count++;            // Keep track of how many
   }
 }
 // Average -- divide by how many
 if (count > 0) {
   steer.div(count);
 }

 // As long as the vector is greater than 0
 if (steer.mag() > 0) {
   // Implement Reynolds: Steering = Desired - Velocity
   steer.normalize();
   steer.mult(this.maxspeed);
   steer.sub(this.velocity);
   steer.limit(this.maxforce);
 }
 return steer;
}

// Alignment
// For every nearby boid in the system, calculate the average velocity
Boid.prototype.align = function(boids) {
 let neighbordist = 50;
 let sum = createVector(0,0);
 let count = 0;
 for (let i = 0; i < boids.length; i++) {
   let d = p5.Vector.dist(this.position,boids[i].position);
   if ((d > 0) && (d < neighbordist)) {
     sum.add(boids[i].velocity);
     count++;
   }
 }
 if (count > 0) {
   sum.div(count);
   sum.normalize();
   sum.mult(this.maxspeed);
   let steer = p5.Vector.sub(sum, this.velocity);
   steer.limit(this.maxforce);
   return steer;
 } else {
   return createVector(0, 0);
 }
}

// Cohesion
// For the average location (i.e. center) of all nearby boids, calculate steering vector towards that location
Boid.prototype.cohesion = function(boids) {
 let neighbordist = 50;
 let sum = createVector(0, 0);   // Start with empty vector to accumulate all locations
 let count = 0;
 for (let i = 0; i < boids.length; i++) {
   let d = p5.Vector.dist(this.position,boids[i].position);
   if ((d > 0) && (d < neighbordist)) {
     sum.add(boids[i].position); // Add location
     count++;
   }
 }
 if (count > 0) {
   sum.div(count);
   return this.seek(sum);  // Steer towards the location
 } else {
   return createVector(0, 0);
 }
}
