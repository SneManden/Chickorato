KGame.Egg = function(kgame, game, position, frame, id, isGolden) {
    this.kgame = kgame;
    this.game = game;
    this.position = (typeof position === "undefined" ? {x:0, y:0} : position);
    this.frame = (typeof frame === "undefined" ? 19 : frame);
    this.id = (typeof id === "undefined" ? "egg"+new Date().getTime() : id);
    this.isGolden = (typeof isGolden === "undefined" ? false : isGolden);
};
KGame.Egg.prototype = {

    toString: function() {
        return this.id;
    },

    create: function() {
        this.sprite = this.game.add.sprite(
            this.position.x, this.position.y, "entities", this.frame);
        this.sprite.anchor.set(0.5);
    }

};



KGame.GoldenEgg = function(kgame, game, position, frame, id, isGolden) {
    KGame.Egg.call(this, kgame, game, position, 20, id, true);
};
KGame.GoldenEgg.prototype = new KGame.Egg();
KGame.GoldenEgg.constructor = KGame.GoldenEgg;
// KGame.GoldenEgg.prototype.function = function() {};