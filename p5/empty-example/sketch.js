var button;
function setup() {
  // put setup code here
  createCanvas(640, 480);
  button = createButton("save");
  button.mousePressed(saveImage);
}

function saveImage() {
  save();
}

function draw() {
  // put drawing code here
  if (mouseIsPressed) {
    fill( map(mouseX,0,width,0,255),
          map(mouseY,0,height,0,255),
          map(mouseX+mouseY,0,width+height,0,255),
        100);
  } else {
    fill(map(mouseY,0,height,0,255),
          map(mouseX,0,width,0,255),
          map(mouseX+mouseY,0,width+height,0,255),
        100);
  }
  noStroke();
  ellipse(mouseX, mouseY, 80, 80);
}
