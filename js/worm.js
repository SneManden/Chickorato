KGame.Worm = function(kgame, game, position, type) {
    this.kgame = kgame;
    this.game = game;
    this.position = (typeof position === "undefined" ? {x:0, y:0} : position);
    this.types = {"nodraw":0, "nouse":1};
    this.type = (typeof type === "undefined" ?
        Math.floor(Math.random()*2) : this.types[type]);
    this.id = "worm-"+["nodraw", "nouse"][this.type];
};
KGame.Worm.prototype = {

    toString: function() {
        return this.id;
    },

    create: function() {
        this.sprite = this.game.add.sprite(
            this.position.x, this.position.y, "entities", 21+this.type);
        this.sprite.anchor.set(0.5);
    }

};