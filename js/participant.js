KGame.Participant = function(kgame, game, position, frame, name) {
    this.kgame = kgame;
    this.game = game;
    this.position = (typeof position === "undefined" ? {x:0, y:0} : position);
    this.frame = frame;
    this.names = [
        "Joe", "Bill", "George", "Carl", "Matt", "Paul", "Thomas", "Elizabeth"
    ];
    this.name = (typeof name === "undefined" ? this.names[this.frame] : name);
    // Game variables
    this.rooster = null;
    this.chickens = [];
    this.eggs = [];
    this.goldenEgg = null;
    this.cards = [];
    this.numGreyChickens = 0;
    this.numBrownChickens = 0;
};
KGame.Participant.prototype = {

    toString: function() {
        return this.name;
    },

    create: function() {
        this.sprite = this.game.add.sprite(
            this.position.x, this.position.y, "participants", this.frame);
        this.sprite.anchor.set(0.5);
    },

    // Called by game-master when it is the participants turn
    active: function() {
        this.kgame.rollDice(this);
        // Call endTurn after 1 second (context=this)
        this.game.time.events.add(this.kgame.waitNextTime, this.endTurn, this);
    },

    endTurn: function() {
        this.kgame.next();
    },

    score: function() {
        return this.eggs.length + (this.goldenEgg === null ? 0 : 3);
    },

    numChickens: function(color) {
        if (color === "brown")   return this.numBrownChickens;
        else                    return this.numGreyChickens;
    },

    getsChicken: function(chicken) {
        if (chicken.color === "brown")   this.numBrownChickens++;
        else                            this.numGreyChickens++;
        this.chickens.push(chicken);
    },

    loseChicken: function(chicken) {
        if (chicken.color === "brown")   this.numBrownChickens--;
        else                            this.numGreyChickens--;
        this.chickens.splice(this.chickens.indexOf(chicken), 1);
    },

    getsEgg: function(egg) {
        this.eggs.push(egg);
    },

    getsGoldenEgg: function(egg) {
        this.goldenEgg = egg;
    },

    loseEgg: function(egg) {
        this.eggs.splice(this.eggs.indexOf(egg), 1);
    },

    getsRooster: function(rooster) {
        this.rooster = rooster;
    },

    loseRooster: function(rooster) {
        this.rooster = null;
    },

    // Decider methods: must be implemented by AI/Player
    chooseEgg: function(availableEggs) {
        return null;
    },

    chooseChicken: function(availableChickens) {
        return null;
    },

    lootEggsOrStealChicken: function() { // true="loot", false="steal chicken"
        return null;
    }

};



/**
 * Very simple AI that employs the following strategy:
 *  - Always chooses the egg that was the first to be taken (initially)
 *  - Always chooses the chicken that was the first to be taken (initially)
 *  - Always loots eggs (instead of taking additional chickens)
 *  - Always moves (nodraw)-worm to next next player that is not self
 */
KGame.AIsimple = function(kgame, game, position, frame, name) {
    KGame.Participant.call(this, kgame, game, position, frame, name);
};
KGame.AIsimple.prototype = new KGame.Participant();
KGame.AIsimple.constructor = KGame.AIsimple;
KGame.AIsimple.prototype.chooseEgg = function(availableEggs) {
    return availableEggs[0];
};
KGame.AIsimple.prototype.chooseChicken = function(availableChickens) {
    return availableChickens[0];
};
KGame.AIsimple.prototype.lootEggsOrStealChicken = function() {
    // true="loot", false="steal chicken"
    return true;
};



KGame.Player = function(kgame, game, position, frame) {
    KGame.Participant.call(this, kgame, game, position, frame);
};
KGame.Player.prototype = new KGame.Participant();
KGame.Player.constructor = KGame.Player;