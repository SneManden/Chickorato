KGame.Game = function(game, numPlayers) {
    this.game = game;
    this.numPlayers = (typeof numPlayers === 'undefined' ? 5 : numPlayers);
    this.participants = [];
    this.chickens = [];
    this.worms = [];
    this.eggs = [];
    // Helper arrays
    this.freeChickens = {brown: [], grey: []};
    this.nonFreeChickens = {brown: [], grey: []};
    this.freeEggs = [];
    this.nonFreeEggs = [];
    // Hmm
    this.owners = {};
    // Game variables / constants
    this.faces = ["worm", "blue", "grey", "brown", "grey", "thief"];
    this.numEggs = 33;
    this.numGreyChickens = 4;
    this.numBrownChickens = 3;
    this.current = 0;
    // Misc
    this.center = null;
    this.diceRollTime   = Phaser.Timer.SECOND * 0.5;//0.05;
    this.waitNextTime   = Phaser.Timer.SECOND * 1.5;//0.15;
    this.entityMoveTime = Phaser.Timer.SECOND * 0.5;//0.05;
};
KGame.Game.prototype = {

    preload: function() {
        console.log("Game: preload()");
        // this.time.advancedTiming = true
    },

    create: function() {
        this.center = {x:this.game.width/2, y:this.game.height/2};

        this.addEggs(    {x:this.center.x-this.game.width/10, y:this.center.y});
        this.addWorms({x:this.center.x, y:this.center.y-this.game.height/8});
        this.addChickens({x:this.center.x+this.game.width/10, y:this.center.y});
        this.addParticipants(this.center);

        this.current = -1;
        this.setupCursor();
        this.setupDice();
        this.setupText();
        this.next();
    },

    addParticipants: function(center) {
        var participant, position, frame = -1, frames = [];
        for (var i=0; i<this.numPlayers; i++) {
            position = this.positionNext(
                this.numPlayers, i, center, 8*this.game.width/20);
            while (frame < 0 || frames.indexOf(frame) >= 0)
                frame = Math.floor(Math.random()*8); // frame in {0,1,...,7}
            frames.push(frame);
            participant = new KGame.AIsimple(this, this.game, position, frame);
            this.participants.push(participant);
        }
        this.participants.forEach(function(participant){participant.create();});
    },

    addEggs: function(center) {
        var egg, position;
        for (var i=0; i<this.numEggs+1; i++) {
            position = this.positionRandom(
                center, this.game.width/10, this.eggs, 4);
            if (i != this.numEggs) {
                egg = new KGame.Egg(this, this.game, position, undefined,
                    "egg"+i);
                this.eggs.push(egg);
                this.freeEggs.push(egg);
            } else {
                egg = new KGame.GoldenEgg(this, this.game, position, undefined,
                    "goldeEgg");
                this.goldenEgg = egg;
            }
        }
        this.eggs.forEach(function(egg) { egg.create(); });
        this.goldenEgg.create();
    },

    addChickens: function(center) {
        var chicken, position, color,
            grey = this.numGreyChickens, brown = this.numBrownChickens;
        for (var i=0; i<grey+brown+1; i++) {
            if (i<grey)             color = "grey";
            else if (i<grey+brown)  color = "brown";
            else                    color = "blue";
            position = this.positionRandom(
                center, this.game.width/12, this.chickens, 8);
            chicken = new KGame.Chicken(this, this.game, position, color,
                color+"Chicken"+i);
            this.chickens.push(chicken);
            if (color == "blue")
                this.rooster = chicken;
            else if (color == "brown")
                this.freeChickens.brown.push(chicken);
            else
                this.freeChickens.grey.push(chicken);
            this.owners[chicken] = null;
        }
        this.chickens.forEach(function(chicken) { chicken.create(); });
    },

    addWorms: function(center) {
        var worm, position, types = ["nodraw", "nouse"];
        for (var i in types) {
            position = this.positionRandom(
                center, 8, this.worms, 8);
            worm = new KGame.Worm(this, this.game, position, types[i]);
            this.worms.push(worm);
        }
        this.worms.forEach(function(worm) { worm.create(); });
    },

    update: function() {
        // var current = this.participants[this.current];
    },

    setupText: function() {
        var posName = {x: 2, y: 2};
        var style = { font: "12px", fill: 0x000000 };
        this.texts = {
            currentName: this.game.add.text(posName.x, posName.y, "", style)
        };
    },

    setupCursor: function() {
        this.cursor = this.game.add.sprite(-10, -10, "cursor", 32);
        this.cursor.anchor.set(0.5);
        // this.cursor.animations.add("cursor", [32,33,34,33,32], 8, true);
        // this.cursor.animations.play("cursor");
    },

    moveCursor: function(current) {
        this.cursor.position = {
            x:this.participants[current].sprite.position.x,
            y:this.participants[current].sprite.position.y+5
        };
    },

    setupDice: function() {
        this.dice = this.game.add.sprite(8, this.game.height-8, "dice", 24);
        this.dice.anchor.set(0.5);
    },

    /* ===================
     * BEGIN  game methods */

    next: function() {
        // Check game state
        if (this.owners[this.goldenEgg] != null) {
            this.gameover();
            return;
        }
        // Next participants turn
        this.current = (this.current+1) % this.numPlayers;
        this.participants[this.current].active();
        // Display cursor and player name
        this.moveCursor(this.current);
        this.texts.currentName.setText(this.participants[this.current].name);
    },

    gameover: function() {
        this.game.scoreboard = this.participants;
        this.state.start("Score");
    },

    rollDice: function(player) {
        this.animateDice(function(face) {
            this.decide(player, face);
        });
    },

    decide: function(player, face) {
        console.log("Player",player.name,"rolls the dice and get '",face,"'");
        switch (face) {
            case "brown":
            case "grey":    // Participant must take a chicken or loot eggs
                var takeOrStealChicken = function() {
                    var chicken;
                    if (this.freeChickens[face].length > 0){// take free chicken
                        chicken = this.freeChickens[face].pop();
                        console.log("  ", player.name, "takes a free",
                            face, "chicken");
                    }
                    else { // Steal a chicken
                        var availableChickens = [];
                        for (var i in this.nonFreeChickens[face]) {
                            var otherChicken = this.nonFreeChickens[face][i];
                            if (this.owners[otherChicken] == player) continue;
                            availableChickens.push(otherChicken);
                        }
                        chicken = player.chooseChicken(availableChickens);
                        console.log("  ", player.name, "steals a", face,
                            "chicken from", this.owners[chicken].name);
                    }
                    this.switchOwner(player, chicken, "chicken", face);
                };
                var lootEggs = function() {
                    var multiplier = (player.rooster == null ? 1 : 2);
                    console.log("  ", player.name, "chose to loot",
                        player.numChickens(face), "eggs",
                        (player.rooster === null ? "":"(has rooster)"));
                    for (var i=0; i<player.numChickens(face)*multiplier; i++) {
                        var egg;
                        if (this.freeEggs.length > 0)
                            egg = this.freeEggs.pop();
                        else if (this.freeEggs.length == 0
                              && this.owners[this.goldenEgg] == null)
                            egg = this.goldenEgg;
                        else
                            break;
                        this.switchOwner(player, egg, "egg");
                    }
                };
                if (player.numChickens(face) == 0) { // Player has no chicken
                    takeOrStealChicken.call(this);
                } else { // Player has a chicken of color
                    console.log("  ", player.name, "has", player.numChickens(face),
                        face, "chickens");
                    if (player.lootEggsOrStealChicken())
                        lootEggs.call(this);
                    else
                        takeOrStealChicken.call(this);
                }
                break;
            case "blue":    // Participant gets the rooster
                this.switchOwner(player, this.rooster, "rooster");
                console.log("  ", player.name, "gets the rooster");
                break;
            case "thief":   // Participant must take an egg
                var egg = null;
                // All eggs are free OR player has all eggs
                if (this.nonFreeEggs.length == player.eggs.length) {
                    var egg;
                    if (this.freeEggs.length > 0)
                        egg = this.freeEggs.pop();
                    else if (this.freeEggs.length == 0
                          && this.owners[this.goldenEgg] == null)
                        egg = this.goldenEgg;
                    else
                        break;
                    console.log("  ", player.name, "takes a free egg");
                } else if (this.nonFreeEggs.length == player.eggs.length+1) {
                    // Find other egg that is not player's
                    for (var i in this.nonFreeEggs) {
                        var otherEgg = this.nonFreeEggs[i];
                        if (this.owners[otherEgg] === player) continue;
                        egg = otherEgg;
                    }
                    console.log("  ", player.name, "steals an egg from",
                        this.owners[egg].name, "(had no choice)");
                } else { // User decide victim to steal egg from
                    // Generate array of eggs that can be stolen
                    var availableEggs = [], othereggs;
                    for (var i in this.nonFreeEggs) {
                        var otherEgg = this.nonFreeEggs[i];
                        if (this.owners[otherEgg] == player) continue;
                        availableEggs.push(otherEgg);
                    }
                    egg = player.chooseEgg(availableEggs);
                    console.log("  ", player.name, "steals an egg from",
                        this.owners[egg].name);
                }
                this.switchOwner(player, egg, "egg");
                break;
            case "worm":    // Participant must move a worm
                // TODO decide worm type & victim (even self)
                break;
        }
    },

    switchOwner: function(player, entity, type, color) {
        if (type == "worm") return;

        // Current owner of entity loses it
        switch (type) {
            case "rooster":
                if (this.owners[entity] != null)
                    this.owners[entity].loseRooster();
                break;
            case "chicken":
                if (this.nonFreeChickens[color].indexOf(entity) == -1)
                    this.nonFreeChickens[color].push(entity);   // Free chicken
                else 
                    this.owners[entity].loseChicken(entity);    // Owned chicken
                break;
            case "egg":
                if (this.nonFreeEggs.indexOf(entity) == -1)
                    this.nonFreeEggs.push(entity);              // Egg was free
                else 
                    this.owners[entity].loseEgg(entity);        // Owned egg
                break;
        }
        // New owner is player
        this.owners[entity] = player;
        console.log("  ", this.owners[entity].name, "now has the", type);
        // Update player inventory
        switch (type) {
            case "rooster": player.getsRooster(entity); break;
            case "chicken": player.getsChicken(entity); break;
            case "egg":
                if (entity.isGolden)    player.getsGoldenEgg(entity);
                else                    player.getsEgg(entity);
                break;
            case "worm":    break;
        }
        this.moveTo(entity, player, 16);
    },

    animateDice: function(callback) {
        var dicerolls, self = this,
            num = Math.floor(Math.random()*6),
            face = this.faces[num];
        var hasRolled = function() {
            this.dice.frame = 24+num;
            this.game.time.events.remove(dicerolls);
            callback.call(self, face);
        };
        var rolls = function() {
            this.dice.frame = Math.floor(Math.random()*6) + 24;
            // this.dice.frame = (this.dice.frame-24+1)%6 + 24;
        };
        this.game.time.events.add(this.diceRollTime, hasRolled, this);
        dicerolls = this.game.time.events.loop(80, rolls, this);
    },

    /* END OF game methods
     * =================== */

    moveTo: function(object, other, radius) {
        var time = this.entityMoveTime;
        // Move object to other
        var pos = this.positionRandom(other.sprite.position, radius, [other],8),
            twn = this.game.add.tween(object.sprite).to(pos, time, null, true);
        // twn.onComplete.add(function() {
        //     this.game.add.world.children.sort("y", Phaser.Group.SORT_ASCENDING);
        // }, this);
    },

    render: function() {
        var pixel = this.game.pixel;
        // Apply screen image to upscaled canvas
        pixel.context.drawImage(this.game.canvas, 0, 0,
            this.game.width, this.game.height, 0, 0, pixel.width, pixel.height);
    },

    positionNext: function(numPlayers, i, center, radius) {
        return this.positionInCircle(radius, 2*Math.PI*i/numPlayers, center);
    },

    positionRandom: function(center, radius, avoid, margin, iter) {
        var dist = this.dist,
            rad = radius*Math.random(),
            deg = 2*Math.PI*Math.random(),
            position = this.positionInCircle(rad, deg, center),
            iter = (typeof iter === "undefined" ? 500 : iter);
        if (typeof avoid !== 'undefined') {
            var minDist;
            while (iter>0) {
                minDist = 2*radius;
                avoid.forEach(function(other) {
                    minDist = Math.min(minDist, dist(other.position, position));
                });
                if (minDist > margin) break;
                rad = radius*Math.random();
                deg = 2*Math.PI*Math.random();
                position = this.positionInCircle(rad, deg, center);
                iter--;
            }
        }
        return position;
    },

    positionInCircle: function(rad, deg, center) {
        return {
            x: center.x + Math.floor( rad*Math.cos(deg) ),
            y: center.y + Math.floor( rad*Math.sin(deg) )
        };
    },

    dist: function(a, b) {
        return Math.sqrt( Math.pow(a.x-b.x,2) + Math.pow(a.y-b.y,2) );
    }

};