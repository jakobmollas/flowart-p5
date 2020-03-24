'use strict'

class Settings {
  constructor() {
    // General
    this.animate = true;
    this.showDiagnostics = true;
    this.drawFlowfield = false;
    
    // Flowfield
    this.wraparound = true;
    this.cells = 100.0;
    this.octaves = 4;
    this.falloff = 0.65;
    this.xy_increment = 0.05;
    this.z_increment = 0.000;
    
    // Particle stuff
    this.count = 1000;
    this.pointSize = 1.0;
    this.minSpeed = 2.0;
    this.maxSpeed = 10.0;
    this.minLifeInSeconds = 1.0;
    this.maxLifeInSeconds = 5.0;
    this.alpha = 7.0;
    this.fancyColors = false;
    this.fancyColorRange = 100;
    this.staticColor = 0;
  }
}

let gui = null;
let settings = new Settings();

let sclx, scly;
let zoff = 0;
let particles = [];
let flowfield;

function setup() {
  let canvas = createCanvas(windowWidth, windowHeight);
  canvas.style('display', 'block');

  textFont('monospace');

  initializeGuiControls();
  initNewRandomWorld();
}

function initNewRandomWorld() {
  // Randomize
  // settings.animate = true;
  // settings.showDiagnostics = true;
  // settings.drawFlowfield = false;
  
  // Flowfield
  settings.wraparound = floor(random(0, 2));
  settings.cells = floor(random(3, 100.0));
  settings.octaves = floor(random(2, 8));
  settings.falloff = random(0.1, 0.75);
  settings.xy_increment = random(0.01, 0.2);
  settings.z_increment = floor(random(4)) == 1 ? random(0.0001, 0.001) : 0;
  
  // Particle stuff
  //settings.count = 2000;
  settings.pointSize = floor(random(1, 4 ));
  settings.minSpeed = random(0, 3);
  settings.maxSpeed = settings.minSpeed + random(0, 10);
  settings.minLifeInSeconds = random(0, 3);
  settings.maxLifeInSeconds = settings.minLifeInSeconds + random(0, 20);
  settings.alpha = random(5, 15);
  settings.fancyColors = floor(random(0, 2));
  settings.fancyColorRange = random(20, 100);
  settings.staticColor = random(0, 100);

  updateControls();
  init();
}

function init() {
  initializeFlowField();
  initializeParticles();
  background(0);
}

function initializeFlowField() {
  noiseDetail(settings.octaves, settings.falloff);

  sclx = width / settings.cells;
  scly = height / settings.cells;
  
  flowfield = new Array(settings.cells * settings.cells);
}

function initializeGuiControls() {
  gui = new dat.GUI()
  gui.add(settings, 'animate');
  gui.add(settings, 'drawFlowfield').onFinishChange(n => init());
  gui.add(settings, 'cells', 1, 200).step(1).onFinishChange(n => init());
  gui.add(settings, 'octaves', 1, 10).step(1).onFinishChange(n => init());
  gui.add(settings, 'falloff', 0, 1).onFinishChange(n => init());
  gui.add(settings, 'xy_increment', 0, 0.2).onFinishChange(n => init());
  gui.add(settings, 'z_increment', 0, 0.05).onFinishChange(n => init());
  gui.add(settings, 'count', 1, 5000).step(1).onFinishChange(n => init());
  
  gui.close();
}

function initializeParticles() {
  particles = [];

  for (var i = 0; i < settings.count; i++)
    particles[i] = new Particle();
}

function windowResized() {
  setup();
}

function keyTyped() {
  switch (key) {
    case "a":
      settings.animate = !settings.animate;
      break;

    case "d":
      settings.showDiagnostics = !settings.showDiagnostics;
      break;

      case " ":
        initNewRandomWorld();
        break;

    default:
      // Prevent default behavior
      return false;
  }
}

// Main update loop
function draw() {
  //background(0, 10);

  if (settings.showDiagnostics)
    drawDiagnostics();

  if (settings.animate) {
    updateFlowfield();
    updateParticles();
  }

  if (settings.drawFlowfield)
    drawFlowfield();
}

function updateFlowfield() {
  let yoff = 0;
  for (let y = 0; y < settings.cells; y++) {
    let xoff = 0;
    for (let x = 0; x < settings.cells; x++) {
      let index = x + y * settings.cells;
      let angle = noise(xoff, yoff, zoff) * TWO_PI * 2;
      let v = p5.Vector.fromAngle(angle);
      flowfield[index] = v;
      
      xoff += settings.wraparound 
        ? (x < (settings.cells / 2) ? settings.xy_increment : -settings.xy_increment) 
        : settings.xy_increment;
    }

    yoff += settings.wraparound 
        ? (y < (settings.cells / 2) ? settings.xy_increment : -settings.xy_increment) 
        : settings.xy_increment;
  }

  zoff += settings.z_increment;
}

function drawFlowfield() {
  
  stroke(255, 50);
  strokeWeight(1);

  for (let y = 0; y < settings.cells; y++) {
    for (let x = 0; x < settings.cells; x++) {
      push();
      translate(x * sclx + sclx / 2, y * scly + scly / 2);
      let index = x + y * settings.cells;
      rotate(flowfield[index].heading());
      line(0, 0, sclx, 0);
      pop();
    }
  }
}

function updateParticles() {
  for (let particle of particles) {
    particle.update(deltaTime, flowfield, sclx, scly, settings.cells);
    particle.draw(settings.pointSize);
  }
}

function updateControls() {
  for (let i in gui.__controllers)
    gui.__controllers[i].updateDisplay();
}

function drawDiagnostics() {
  // Clear background
  push();

  fill(0);
  stroke(0);
  rectMode(CORNER)
  rect(5, 5, 80, 40);

  textSize(12);
  fill(255);
  stroke(0);

  let fps = frameRate();
  text("FPS:   " + fps.toFixed(), 10, 20);
  text("Count: " + particles.length.toFixed(), 10, 40);

  pop();
}