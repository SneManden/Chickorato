KGame.Menu = function(game) {
    this.game = game;
};
KGame.Menu.prototype = {

    create: function() {
        console.log("Menu: create()");
        this.state.start("Game");
    },

    render: function() {
        var pixel = this.game.pixel;
        // Apply screen image to upscaled canvas
        pixel.context.drawImage(this.game.canvas, 0, 0,
            this.game.width, this.game.height, 0, 0, pixel.width, pixel.height);
    }

};