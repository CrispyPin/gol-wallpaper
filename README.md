# Game of Life Wallpaper

A simple game of life simulation for live wallpaper apps such as komorebi.
Uses [GPU.js](https://github.com/gpujs/gpu.js)

Settings can be tweaked in the url like this:
    https://crispypin.github.io/gol-wallpaper/?cellsize=16&time=2&margin=3

The full list of options follows:
* `cellsize`: the width of cells in pixels
* `time`: the number of frames per cycle
* `margin`: the width of the grid (subtracted from cellsize)
* `clock`: if true, shows a digital clock that interacts with the simulation
* `populate`: if true, starts the board with 30% of cells alive
