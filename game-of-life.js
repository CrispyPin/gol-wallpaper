'use strict'

//neighbor positions
const nx = [-1, 0, 1, -1, 1, -1, 0, 1];
const ny = [-1, -1, -1, 0, 0, 1, 1, 1];

class GameOfLife {
    constructor(id, cellSize=16, timeStep=10) {
        this.app = document.getElementById(id);
        this.canvas = this.app.getElementsByTagName("canvas")[0];
        this.ctx = this.canvas.getContext("2d");

        var width = Math.floor(this.canvas.clientWidth / cellSize);
        var height = Math.floor(this.canvas.clientHeight / cellSize);

        this.canvas.width = width * cellSize;
        this.canvas.height = height * cellSize;

        this.run = this.run.bind(this);
        
        this.worldWidth = width;
        this.worldHeight = height;
        this.world = matrix(width, height, "r");
        this.cellSize = cellSize;

        this.timeStep = timeStep;//frames per step
        this.sinceStep = 0;
        
        this.run();
    }

    step() {
        let newWorld = matrix(this.worldWidth, this.worldHeight);
        let neighbors = matrix(this.worldWidth, this.worldHeight, 0);
        
        //count neighbors
        for (let y = 0; y < this.worldHeight; y++) {
            for (let x = 0; x < this.worldWidth; x++) {
                if (this.world[y][x]) {
                    //add to neighbor count of all surrounding cells
                    for (let pos = 0; pos < 8; pos++) {
                        let xp = x+nx[pos];
                        let yp = y+ny[pos];
                        if (xp < this.worldWidth && xp >= 0 && yp < this.worldHeight && yp >= 0) {
                            neighbors[yp][xp]++;
                        }
                    }
                }
            }
        }
    
        //update state
        for (let y = 0; y < this.worldHeight; y++) {
            for (let x = 0; x < this.worldWidth; x++) {
                newWorld[y][x] = this.newState(this.world[y][x], neighbors[y][x]);
            }
        }
        
        this.world = newWorld;
        
        this.render();
    }

    newState(state, neighbors) {
        if (state) {
            return (neighbors >= 2 && neighbors <= 3);
        } else {
            return neighbors == 3;
        }
    }
    
    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = "#048";
        for (let y = 0; y < this.worldHeight; y++) {
            for (let x = 0; x < this.worldWidth; x++) {
                if (this.world[y][x]) {
                    this.ctx.fillStyle = "rgb("+x/this.worldWidth*255 + "," + y/this.worldHeight*255 +",255)";
                    this.ctx.fillRect(x * this.cellSize, y * this.cellSize, this.cellSize - 1, this.cellSize - 1);
                }
            }
        }
    }

    run() {
        this.sinceStep++;
        if (this.sinceStep >= this.timeStep) {
            this.sinceStep = 0;
            this.step();
        }
        window.requestAnimationFrame(this.run);
        
    }

    randomizeWorld() {
        this.world = matrix(this.worldWidth, this.worldHeight, "r");
        this.render();
    }
}

function matrix(width, height, fill=false, weight=0.3) {
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

let gameOfLife = new GameOfLife("gol", 6, 5);
