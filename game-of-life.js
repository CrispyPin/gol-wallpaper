'use strict'

//neighbor positions
const nx = [-1, 0, 1, -1, 1, -1, 0, 1];
const ny = [-1, -1, -1, 0, 0, 1, 1, 1];

const cellSize = 6;
const margin = 1;
const framesPerStep = 5;

class GameOfLife {
    constructor(id) {
        this.canvas = document.getElementById(id);
        this.ctx = this.canvas.getContext("2d");

        this.width = Math.floor(window.innerWidth / cellSize);
        this.height =  Math.floor(window.innerHeight / cellSize);

        this.canvas.width = this.width * cellSize;
        this.canvas.height = this.height * cellSize;

        this.run = this.run.bind(this);
        
        this.world = matrix(this.width, this.height, "r");
        
        this.sinceStep = 0;
    }

    step() {
        let newWorld = matrix(this.width, this.height);
        let neighbors = matrix(this.width, this.height, 0);
        
        //count neighbors
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (this.world[y][x]) {
                    //add to neighbor count of all surrounding cells
                    for (let pos = 0; pos < 8; pos++) {
                        let xp = x+nx[pos];
                        let yp = y+ny[pos];
                        if (xp < this.width && xp >= 0 && yp < this.height && yp >= 0) {
                            neighbors[yp][xp]++;
                        }
                    }
                }
            }
        }
    
        //update state
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                newWorld[y][x] = this.newState(this.world[y][x], neighbors[y][x]);
            }
        }
        this.world = newWorld;
    }

    newState(state, neighbors) {
        if (state) {
            return (neighbors > 1 && neighbors < 4);
        }
        return neighbors == 3;
    }
    
    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (this.world[y][x]) {
                    this.ctx.fillStyle = "rgb("+(x/this.width*192+64) + "," + (y/this.height*192+64) +",192)";
                    this.ctx.fillRect(x * cellSize, y * cellSize, cellSize - margin, cellSize - margin);
                }
            }
        }
    }

    run() {
        this.sinceStep++;
        if (this.sinceStep >= framesPerStep) {
            this.sinceStep = 0;
            this.step();
            this.render();
        }
        window.requestAnimationFrame(this.run);
    }
}

function matrix(width, height, fill=false, weight=0.4) {
    let m = [];
    let content = fill;

    for (let y = 0; y < height; y++) {
        let n = [];
        for (let x = 0; x < width; x++) {
            if (fill == "r") {
                content = Math.random() < weight;
            }
            n.push(content);
        }
        m.push(Array.from(n));
    }
    return m;
}

let gameOfLife = new GameOfLife("gol");

gameOfLife.run();

