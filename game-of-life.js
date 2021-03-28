'use strict'

//neighbor positions
const nx = [-1, 0, 1, -1, 1, -1, 0, 1];
const ny = [-1, -1, -1, 0, 0, 1, 1, 1];

//settings
let params = new URLSearchParams(location.search);

const cellSize = params.get("cellsize") != null ? params.get("cellsize") | 0 : 5;
const margin = params.get("margin") != null ? params.get("margin") | 0 : 1;
const framesPerStep = params.get("time") != null ? params.get("time") | 0 : 4;
const useClock = params.get("clock") == "true";
const populate = params.get("populate") == "true";

const chars = {
    "0": [" ## ",
        "#  #",
        "#  #",
        "#  #",
        " ## "],
    "1": ["  # ",
        " ## ",
        "  # ",
        "  # ",
        " ###"],
    "2": [" ## ",
        "#  #",
        "  # ",
        " #  ",
        "####"],
    "3": ["### ",
        "   #",
        " ## ",
        "   #",
        "### "],
    "4": ["#  #",
        "#  #",
        "####",
        "   #",
        "   #"],
    "5": ["####",
        "#   ",
        "### ",
        "   #",
        "### "],
    "6": [" ## ",
        "#   ",
        "### ",
        "#  #",
        " ## "],
    "7": ["####",
        "   #",
        "  # ",
        " #  ",
        " #  "],
    "8": [" ## ",
        "#  #",
        " ## ",
        "#  #",
        " ## "],
    "9": [" ## ",
        "#  #",
        " ###",
        "   #",
        " ## "]
};


const gpu = new GPU();

class GameOfLife {
    constructor(id) {
        this.canvas = document.getElementById(id);
        this.ctx = this.canvas.getContext("2d");

        this.width = Math.floor(window.innerWidth / cellSize) + 2;
        this.height =  Math.floor(window.innerHeight / cellSize) + 2;

        this.canvas.width = (this.width-2) * cellSize;
        this.canvas.height = (this.height-2) * cellSize;

        this.run = this.run.bind(this);
        
        this.world = matrix(this.width, this.height, "r", populate ? 0.3 : 0);
        this.sinceStep = 0;

        this.renderWorld = gpu.createKernel(function(world, width, height, cellSize, margin) {
            const cellx = Math.floor(this.thread.x / cellSize);
            const celly = Math.floor((this.thread.y) / cellSize);
            var col = [(cellx/width * 0.75 + 0.25), (celly/height * 0.75 + 0.25), 0.75];
            col *= world[celly+1][cellx+1];
            col *= Math.max(Math.sign(this.thread.x - cellx*cellSize - margin+1), 0);
            col *= Math.max(Math.sign(this.thread.y - celly*cellSize - margin+1), 0);
            col[0] += 0.045;
            col[1] += 0.045;
            col[2] += 0.08;
            this.color(col[0], col[1], col[2], 1);
        }, {output: [this.canvas.width, this.canvas.height], graphical: true});

        this.logicKernel = gpu.createKernel(function(world, width, height, nx, ny) {
            let n = 0;
            //count neighbors
            for (let i = 0; i < 8; i++) {
                const xp = this.thread.x + nx[i];
                const yp = this.thread.y + ny[i];
                n += (xp < width && xp >= 0 && yp < height && yp >= 0 && world[yp][xp] == 1) ? 1 : 0;
            }
            if (world[this.thread.y][this.thread.x] == 1) {
                return (n > 1 && n < 4) ? 1 : 0;
            }
            return n == 3 ? 1 : 0;
        }, {output: [this.width, this.height]});
    }
    
    step() {
        this.world = this.logicKernel(this.world, this.width, this.height, nx, ny);
    }

    render() {
        this.renderWorld(this.world, this.width, this.height, cellSize, margin);
        this.ctx.putImageData(new ImageData(this.renderWorld.getPixels(), this.canvas.width), 0, 0);
    }

    run() {
        this.sinceStep++;
        if (this.sinceStep >= framesPerStep) {
            this.sinceStep = 0;
            this.step();
            this.randomEdges(0.3);
            if (useClock) {
                this.clock();
            }
            this.render();
        }
        window.requestAnimationFrame(this.run);
    }

    randomEdges(weight=0.4) {
        for (let x = 0; x < this.width; x++) {
            this.world[0][x] = Math.random() < weight;
            this.world[this.height - 1][x] = Math.random() < weight;
        }
        for (let y = 0; y < this.height; y++) {
            this.world[y][0] = Math.random() < weight;
            this.world[y][this.width - 1] = Math.random() < weight;
        }
    }

    clock() {
        const posx = Math.floor(this.width/2);
        const posy = this.height - 16;
        const time = new Date();
        const h = time.getHours().toString();
        const m = time.getMinutes().toString();
        const s = time.getSeconds().toString();
        this.char(posx-17, posy, (h.length==2 ? h[0] : "0"));
        this.char(posx-12, posy, (h.length==2 ? h[1] : h));
        
        this.char(posx-5, posy, (m.length==2 ? m[0] : "0"));
        this.char(posx, posy, (m.length==2 ? m[1] : m));

        this.char(posx+7, posy, (s.length==2 ? s[0] : "0"));
        this.char(posx+12, posy, (s.length==2 ? s[1] : s));
    }

    char(posx, posy, c) {
        for (let y = 0; y < chars[c].length; y++) {
            const row = chars[c][chars[c].length - y-1];
            for (let x = 0; x < row.length; x++) {
                this.world[posy + y][posx + x] = row[x]=="#";
            }
        }
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

