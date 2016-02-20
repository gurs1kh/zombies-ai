
// GameBoard code below

function distance(a, b) {
    var dx = a.x - b.x;
    var dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
}

function direction(a, b) {
    var dx = a.x - b.x;
    var dy = a.y - b.y;
    var dist = Math.sqrt(dx * dx + dy * dy);
    if(dist > 0) return { x: dx / dist, y: dy / dist }; else return {x:0,y:0};
}

function randomInt(n) {
    return Math.floor(Math.random() * n);
}

function Rock(game) {
    this.player = 1;
    this.radius = 4;
    this.name = "Rock";
    this.color = "Gray";
    this.maxSpeed = 200;
    this.thrown = false;

    Entity.call(this, game, this.radius + Math.random() * (800 - this.radius * 2), this.radius + Math.random() * (800 - this.radius * 2));

    this.velocity = { x: 0, y: 0 };

};

Rock.prototype = new Entity();
Rock.prototype.constructor = Rock;

Rock.prototype.collide = function (other) {
    return distance(this, other) < this.radius + other.radius;
};

Rock.prototype.collideLeft = function () {
    return (this.x - this.radius) < 0;
};

Rock.prototype.collideRight = function () {
    return (this.x + this.radius) > 800;
};

Rock.prototype.collideTop = function () {
    return (this.y - this.radius) < 0;
};

Rock.prototype.collideBottom = function () {
    return (this.y + this.radius) > 800;
};

Rock.prototype.update = function () {
    Entity.prototype.update.call(this);
    //  console.log(this.velocity);

    this.x += this.velocity.x * this.game.clockTick;
    this.y += this.velocity.y * this.game.clockTick;

    if (this.collideLeft() || this.collideRight()) {
        this.velocity.x = 0;
        this.velocity.y = 0;
        if (this.collideLeft()) this.x = this.radius;
        if (this.collideRight()) this.x = 800 - this.radius;
    }

    if (this.collideTop() || this.collideBottom()) {
        this.velocity.x = 0;
        this.velocity.y = 0;
        if (this.collideTop()) this.y = this.radius;
        if (this.collideBottom()) this.y = 800 - this.radius;
    }

    var chasing = false;
    for (var i = 0; i < this.game.entities.length; i++) {
        var ent = this.game.entities[i];
        if (ent !== this && ent.name === "Rock" && this.thrown && ent.thrown && this.collide(ent)) {
            var temp = { x: this.velocity.x, y: this.velocity.y };

            var dist = distance(this, ent);
            var delta = this.radius + ent.radius - dist;
            var difX = (this.x - ent.x) / dist;
            var difY = (this.y - ent.y) / dist;

            this.x += difX * delta / 2;
            this.y += difY * delta / 2;
            ent.x -= difX * delta / 2;
            ent.y -= difY * delta / 2;

            this.velocity.x = ent.velocity.x * friction;
            this.velocity.y = ent.velocity.y * friction;
            ent.velocity.x = temp.x * friction;
            ent.velocity.y = temp.y * friction;
            this.x += this.velocity.x * this.game.clockTick;
            this.y += this.velocity.y * this.game.clockTick;
            ent.x += ent.velocity.x * this.game.clockTick;
            ent.y += ent.velocity.y * this.game.clockTick;
        }
    }

    var speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
    if (speed > this.maxSpeed) {
        var ratio = this.maxSpeed / speed;
        this.velocity.x *= ratio;
        this.velocity.y *= ratio;
    }

    this.velocity.x -= (1 - friction) * this.game.clockTick * this.velocity.x;
    this.velocity.y -= (1 - friction) * this.game.clockTick * this.velocity.y;
};

Rock.prototype.draw = function (ctx) {
    ctx.beginPath();
    ctx.fillStyle = this.color;
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fill();
    ctx.closePath();

};


function Zombie(game, clone) {
    this.player = 1;
    this.radius = 10;
    this.visualRadius = 500;
    this.name = "Zombie";
    this.color = "Red";
    this.maxSpeed = minSpeed + (maxSpeed - minSpeed) * Math.random();

    if (!clone) {
        Entity.call(this, game, this.radius + Math.random() * (800 - this.radius * 2), this.radius + Math.random() * (800 - this.radius * 2));
    } else {
        if (clone.x < 0) clone.x = 0;
        if (clone.y < 0) clone.y = 0;
        if (clone.x > 800) clone.x = 800;
        if (clone.y > 800) clone.y = 800;
        if (clone.x > 0 && clone.y > 0 && clone.x < 800 && clone.y < 800) {
            Entity.call(this, game, clone.x, clone.y);
        } else {
            Entity.call(this, game, 400, 400);
        }
    }
    this.velocity = { x: Math.random() * 1000, y: Math.random() * 1000 };
    var speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
    if (speed > this.maxSpeed) {
        var ratio = this.maxSpeed / speed;
        this.velocity.x *= ratio;
        this.velocity.y *= ratio;
    }
};

Zombie.prototype = new Entity();
Zombie.prototype.constructor = Zombie;

Zombie.prototype.collide = function (other) {
    return distance(this, other) < this.radius + other.radius;
};

Zombie.prototype.collideLeft = function () {
    return (this.x - this.radius) < 0;
};

Zombie.prototype.collideRight = function () {
    return (this.x + this.radius) > 800;
};

Zombie.prototype.collideTop = function () {
    return (this.y - this.radius) < 0;
};

Zombie.prototype.collideBottom = function () {
    return (this.y + this.radius) > 800;
};

start = Date.now() / 1000;
Zombie.prototype.update = function () {
    Entity.prototype.update.call(this);
 //  console.log(this.velocity);

    this.x += this.velocity.x * this.game.clockTick;
    this.y += this.velocity.y * this.game.clockTick;

    if (this.collideLeft() || this.collideRight()) {
        this.velocity.x = -this.velocity.x * friction;
        if (this.collideLeft()) this.x = this.radius;
        if (this.collideRight()) this.x = 800 - this.radius;
        this.x += this.velocity.x * this.game.clockTick;
        this.y += this.velocity.y * this.game.clockTick;
    }

    if (this.collideTop() || this.collideBottom()) {
        this.velocity.y = -this.velocity.y * friction;
        if (this.collideTop()) this.y = this.radius;
        if (this.collideBottom()) this.y = 800 - this.radius;
        this.x += this.velocity.x * this.game.clockTick;
        this.y += this.velocity.y * this.game.clockTick;
    }

    var chasing = false;
    for (var i = 0; i < this.game.entities.length; i++) {
        var ent = this.game.entities[i];
        if (ent !== this && this.collide(ent)) {
            if (ent.name === "Zombie") {
                var temp = { x: this.velocity.x, y: this.velocity.y };

                var dist = distance(this, ent);
                var delta = this.radius + ent.radius - dist;
                var difX = (this.x - ent.x) / dist;
                var difY = (this.y - ent.y) / dist;

                this.x += difX * delta / 2;
                this.y += difY * delta / 2;
                ent.x -= difX * delta / 2;
                ent.y -= difY * delta / 2;

                this.velocity.x = ent.velocity.x * friction;
                this.velocity.y = ent.velocity.y * friction;
                ent.velocity.x = temp.x * friction;
                ent.velocity.y = temp.y * friction;
                this.x += this.velocity.x * this.game.clockTick;
                this.y += this.velocity.y * this.game.clockTick;
                ent.x += ent.velocity.x * this.game.clockTick;
                ent.y += ent.velocity.y * this.game.clockTick;
            }
            if (ent.name !== "Zombie" && ent.name !== "Rock" && !ent.removeFromWorld) {
                ent.removeFromWorld = true;
                console.log(ent.name + " kills: " + ent.kills);
				var time = Math.floor(Date.now() / 1000 - start);
				console.log("survival time: ", Math.floor(time / 60) + ":" + time % 60);
                var newZombie = new Zombie(this.game, ent);
                this.game.addEntity(newZombie);
            }
            if (ent.name === "Rock" && ent.thrown) {
                this.removeFromWorld = true;
                ent.thrown = false;
                ent.velocity.x = 0;
                ent.velocity.y = 0;
                ent.thrower.kills++;
            }
        }
        var acceleration = 1000000;

        if (ent.name !== "Zombie" && ent.name !== "Rock" && this.collide({ x: ent.x, y: ent.y, radius: this.visualRadius })) {
            var dist = distance(this, ent);
            if (dist > this.radius + ent.radius + 2) {
                var difX = (ent.x - this.x)/dist;
                var difY = (ent.y - this.y)/dist;
                this.velocity.x += difX * acceleration / (dist * dist);
                this.velocity.y += difY * acceleration / (dist * dist);
            }
            chasing = true;
        }

        
    }

    if (!chasing) {
        ent = this.game.zombies[randomInt(this.game.zombies.length)];
        var dist = distance(this, ent);
        if (dist > this.radius + ent.radius + 2) {
            var difX = (ent.x - this.x) / dist;
            var difY = (ent.y - this.y) / dist;
            this.velocity.x += difX * acceleration / (dist * dist);
            this.velocity.y += difY * acceleration / (dist * dist);
        }

    }

    var speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
    if (speed > this.maxSpeed) {
        var ratio = this.maxSpeed / speed;
        this.velocity.x *= ratio;
        this.velocity.y *= ratio;
    }

    this.velocity.x -= (1 - friction) * this.game.clockTick * this.velocity.x;
    this.velocity.y -= (1 - friction) * this.game.clockTick * this.velocity.y;
};

Zombie.prototype.draw = function (ctx) {
    ctx.beginPath();
    ctx.fillStyle = this.color;
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fill();
    ctx.closePath();

};

function Player(game) {
    this.player = 1;
    this.radius = 10;
    this.rocks = 0;
    this.kills = 0;
    this.visualRadius = 500;
    this.name = "Player 1";
    this.color = "White";
    this.cooldown = 0;
    Entity.call(this, game, this.radius + Math.random() * (800 - this.radius * 2), this.radius + Math.random() * (800 - this.radius * 2));

    this.velocity = { x: Math.random() * 1000, y: Math.random() * 1000 };
    var speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
    if (speed > maxSpeed) {
        var ratio = maxSpeed / speed;
        this.velocity.x *= ratio;
        this.velocity.y *= ratio;
    }
};

// the "main" code begins here
var friction = 1;
var maxSpeed = 100;
var minSpeed = 5;

var ASSET_MANAGER = new AssetManager();

ASSET_MANAGER.downloadAll(function () {
    console.log("starting up da sheild");
    var canvas = document.getElementById('gameWorld');
    var ctx = canvas.getContext('2d');

    var numZombies = 1;
    var numPlayers = 6;
    var numRocks = 12;

    var gameEngine = new GameEngine();
    var circle;
    for (var i = 0; i < numPlayers; i++) {
        circle = new MS(gameEngine);
        gameEngine.addEntity(circle);
    }
    
    for (var i = 0; i < numZombies; i++) {
        circle = new Zombie(gameEngine);
        gameEngine.addEntity(circle);
    }

    for (var i = 0; i < numRocks; i++) {
        circle = new Rock(gameEngine);
        gameEngine.addEntity(circle);
    }
    gameEngine.init(ctx);
    gameEngine.start();
});
