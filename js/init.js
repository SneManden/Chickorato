var KGame = {};

KGame.Init = function(game) {
    this.game = game;
};
KGame.Init.prototype = {

    init: function() {
        console.log("Init: init()");
        var game = this.game,
            pixel = this.game.pixel;
        // Hide un-scaled canvas
        game.canvas.style["display"] = "none";
        // Create the scaled canvas
        pixel.canvas = Phaser.Canvas.create(game.width*pixel.scale,
            game.height*pixel.scale);
        // Store canvas context
        pixel.context = pixel.canvas.getContext("2d");
        // Add canvas to the DOM
        Phaser.Canvas.addToDOM(pixel.canvas);
        // Disable smoothing (proper pixelized scaling)
        Phaser.Canvas.setSmoothingEnabled(pixel.context, false);
        // Cache width and height
        pixel.width = pixel.canvas.width;
        pixel.height = pixel.canvas.height;
    },

    preload: function() {
        console.log("Init: preload()");
        this.stage.backgroundColor = 0x4FD658;
    },

    create: function() {
        console.log("Init: create()");
        this.state.start("Preload");
    }

};