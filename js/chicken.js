KGame.Chicken = function(kgame, game, position, color, id) {
    this.kgame = kgame;
    this.game = game;
    this.position = (typeof position === "undefined" ? {x:0, y:0} : position);
    this.colors = {"grey":0, "brown":1, "blue":2};
    this.color = (typeof color === "undefined" ? "grey" : color);
    this.frame = this.colors[this.color];
    this.id = (typeof id === "undefined" ? "chicken"+new Date().getTime() : id);
};
KGame.Chicken.prototype = {

    toString: function() {
        return this.id;
    },

    create: function() {
        this.sprite = this.game.add.sprite(
            this.position.x, this.position.y, "entities", 16+this.frame);
        this.sprite.anchor.set(0.5);
    }

};



KGame.Rooster = function(kgame, game, position) {
    Kgame.Chicken.call(this, kgame, game, position, "blue");
};
KGame.Rooster.prototype = new KGame.Chicken();
KGame.Rooster.constructor = KGame.Rooster;
// KGame.Rooster.prototype.function = function() {};