class Shape {
    constructor(x, y, w, h) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }
}

class Disc {
    constructor(x, y, w, h, c, note) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.c = c;
        this.note = note;
    }
}

class DiscHolder {
    constructor(base, spike, discs) {
        this.base = base;
        this.spike = spike;
        this.discs = discs;
    }
    
    removeDisc() {
        return this.discs.pop();
    }
    
    addDisc(disc) {
        let n = this.discs.length;
        const y = baseYPosition - (DISC_HEIGHT * (n + 1));
        disc.y = y;
        this.discs.push(disc);
    }
    
    hasDiscs() {
        return this.discs.length !== 0;
    }
    
}

////////////////////////////////////////////////////////////////////////////////

let discImages = [];

function preload() {
    baseImage = loadImage("assets/base-export.png");
    spikeImage = loadImage("assets/spike-export.png"); 
}

////////////////////////////////////////////////////////////////////////////////

let width = window.innerWidth
|| document.documentElement.clientWidth
|| document.body.clientWidth;

let height = window.innerHeight
|| document.documentElement.clientHeight
|| document.body.clientHeight;

////////////////////////////////////////////////////////////////////////////////

let btn;
let btnIsPressed = false;

////////////////////////////////////////////////////////////////////////////////

const borders = [0, width * (1/3), width * (2/3), width];

// BASES
const baseWidth = (borders[1] - borders[0]) / 2; 
const baseHeight = 50;
const baseXPosition = baseWidth / 2;
const baseYPosition = height / 1.5;

// SPIKES
const spikeWidth = baseWidth / 10;
const spikeXPosition = baseXPosition + baseWidth / 2 - spikeWidth / 2 - 2;
const spikeYPosition = baseYPosition - (24 * 8);
const spikeHeight = 300;

const bases = [
    new Shape(borders[0] + baseXPosition, baseYPosition, baseWidth, baseHeight),
    new Shape(borders[1] + baseXPosition, baseYPosition, baseWidth, baseHeight),
    new Shape(borders[2] + baseXPosition, baseYPosition, baseWidth, baseHeight)
];

const spikes = [
    new Shape(borders[0] + spikeXPosition, spikeYPosition, spikeWidth, spikeHeight),
    new Shape(borders[1] + spikeXPosition, spikeYPosition, spikeWidth, spikeHeight),
    new Shape(borders[2] + spikeXPosition, spikeYPosition, spikeWidth, spikeHeight)
];

////////////////////////////////////////////////////////////////////////////////

// The number of discs that will be displayed.
const nDiscs = 8;
// Height of a disc. Should probably be changed.
const DISC_HEIGHT = 20;
// X offset of a disc from the x position of the base.
const discOffset = (spikeXPosition - baseXPosition) / (nDiscs + 1);

// Create three arrays, one for each disc holder.
let discsA = [];
let discsB = [];
let discsC = [];
    let discsArray = [discsA, discsB, discsC];
let discHolders = new Array(3);

// Discs will have alternating colors.
const COLORS = ["#08286d", "#0e2e9f", "#305fb0", "#4fb0b8", "#99d2e3", "#cce8f1", "#EFE8BA", "#EDEAD5"];
const NOTES = ["C3", "F3", "G3", "A#3", "C4", "F4", "G4", "C5"];

////////////////////////////////////////////////////////////////////////////////

let moves = [];
let movesCounter = 0;

function move(f, t) {
    moves.push([f, t]);
}

function moveDisc(a, b) {
    let disc = a.removeDisc();
    monoSynth.setADSR(.1, .1, 0.5, 0.5);
    monoSynth.play(disc.note, 0.5, 0, 1/8);
    b.addDisc(disc);
}

function hanoi(n, a, b, c) {
    if (n==1) {
        move (a, b);
        return;
    }

    hanoi(n-1, a, c, b);
    move(a, b);
    hanoi(n-1, c, b, a);
}

let monoSynth;

function setup() {
    userStartAudio();
    createCanvas(windowWidth, windowHeight);
    background(254, 219, 0);
    frameRate(6);

    button = createButton('Solve');
    button.position(width / 2 - 60, height - 100);
    button.mousePressed(buttonPressed);
    button.addClass("solve-btn")
    
    // Create first array of discs; by default is in the first position.
    for (let i = 0; i < nDiscs; i++) {
        let currentOffset = ((i + 1) * discOffset);
        discsArray[0].push(new Disc(
            baseXPosition + currentOffset, 
            baseYPosition - (DISC_HEIGHT * (i + 1)), 
            baseWidth - (currentOffset * 2), 
            DISC_HEIGHT,
            COLORS[i], NOTES[7 - i]));
    }

    discHolders = [
        new DiscHolder(bases[0], spikes[0], discsArray[0]),
        new DiscHolder(bases[1], spikes[1], discsArray[1]),
        new DiscHolder(bases[2], spikes[2], discsArray[2])
    ];

    // Solve 
    hanoi(nDiscs, 0, 1, 2);

    monoSynth = new p5.PolySynth();
}

////////////////////////////////////////////////////////////////////////////////

function draw() {
    background(254, 219, 0);
    if (movesCounter < moves.length && btnIsPressed) {
        let a = moves[movesCounter][0];
        let b = moves[movesCounter][1];
        moveDisc(discHolders[a], discHolders[b]);
        movesCounter++;
    }

    drawHolders();

    for (let j = 0; j < 3; j++) {
        if (discHolders[j].hasDiscs()) {
            let currentDiscs = discHolders[j].discs;
            for (let i = 0; i < currentDiscs.length; i++) {
                noStroke();
                fill(currentDiscs[i].c);
                rect(borders[j] + currentDiscs[i].x, 
                    currentDiscs[i].y, 
                    currentDiscs[i].w, 
                    currentDiscs[i].h, 4
                );

            }    
        }
    }
    
    
}

function drawHolders() {
    for (let i = 0; i < bases.length; i++) {
        image(baseImage, bases[i].x, bases[i].y);
    }
    
    for (let i = 0; i < spikes.length; i++) {
        image(spikeImage, spikes[i].x, spikes[i].y);
    }
}

function buttonPressed() {
    btnIsPressed = true;
}