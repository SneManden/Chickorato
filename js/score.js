KGame.Score = function(game) {
    this.game = game;
};
KGame.Score.prototype = {

    preload: function() {
    },

    create: function() {
        console.log("Score: create()");

        // Sort participants by score
        var participants = this.game.scoreboard;
        participants.sort(function(a, b) {
            if (a.score() < b.score()) return 1;
            if (a.score() > b.score()) return -1;
            if (b.goldenEgg !== null) return 1;
            if (a.goldenEgg !== null) return -1;
            return 0;
        });

        // Print score to console
        console.log("\nGAME OVER!\n");
        console.log("Scores:");

        // Draw player sprite, name and score
        var nameStyle =  {font:"12px monospace", fill:"#000000", align:"left" },
            scoreStyle = {font:"12px monospace", fill:"#4293EF", align:"right"};
        var player, pos, sprite, texts = {};
        for (var i=0; i<participants.length; i++) {
            player = participants[i];
            console.log("  ", player.name, ":", player.score(),
                (player.goldenEgg === null ? "":"(has golden egg)"));
            pos = { x: this.game.width/6,
                    y: (i+1)*(this.game.height/(participants.length+1)) };
            // Draw player sprite
            part = new KGame.Participant(this, this.game, pos, player.frame,
                player.name);
            part.create();
            if (participants.length <= 4)
                part.sprite.scale.setTo(2.0, 2.0);
            // Draw player name + score
            texts[player.name] = {
                name:  this.game.add.text(pos.x+1*this.game.width/12, pos.y,
                    player.name, nameStyle),
                score: this.game.add.text(pos.x+5*this.game.width/8, pos.y,
                    ""+player.score(), scoreStyle)
            }
            texts[player.name].name.anchor.setTo(0.0, 0.5);
            texts[player.name].score.anchor.set(1.0, 0.5);
            // Draw golden egg
            if (player.goldenEgg !== null) {
                var goldEgg = new KGame.GoldenEgg(this, this.game,
                    {x:pos.x+3.5*this.game.width/5, y:pos.y-2});
                goldEgg.create();
                goldEgg.sprite.scale.setTo(2.0, 2.0);
            }
        }
    },

    render: function() {
        var pixel = this.game.pixel;
        // Apply screen image to upscaled canvas
        pixel.context.drawImage(this.game.canvas, 0, 0,
            this.game.width, this.game.height, 0, 0, pixel.width, pixel.height);
    }

};