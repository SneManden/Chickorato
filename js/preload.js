KGame.Preload = function(game) {
    this.game = game;
};
KGame.Preload.prototype = {

    preload: function() {
        console.log("Preload: preload()");
        this.load.spritesheet("participants", "img/participants.png", 8, 16, 8);
        this.load.spritesheet("entities",     "img/participants.png", 8, 8, 24);
        this.load.spritesheet("dice",         "img/participants.png", 8, 8, 32);
        this.load.spritesheet("cursor",       "img/participants.png", 8, 8, 40);
    },

    create: function() {
        console.log("Preload: create()");
        this.state.start("Menu");
        // this.testScoreBoard();
    },

    testScoreBoard: function() {
        var eggs = [];
        for (var i=0; i<20; i++)
            eggs.push( new KGame.Egg(this, this.game) );
        this.game.scoreboard = [
            new KGame.Participant(this, this.game, undefined, 1),
            new KGame.Participant(this, this.game, undefined, 2),
            // new KGame.Participant(this, this.game, undefined, 3),
            // new KGame.Participant(this, this.game, undefined, 4),
            new KGame.Participant(this, this.game, undefined, 5)
        ];
        for (var i in this.game.scoreboard) {
            var player = this.game.scoreboard[i];
            for (var j=0; j<Math.floor(Math.random()*20); j++)
                player.eggs.push( eggs[j] );
        }
        this.game.scoreboard[Math.floor(Math.random()*this.game.scoreboard.length)]
            .getsGoldenEgg(eggs[eggs.length-1]);
        this.state.start("Score");
    }

};