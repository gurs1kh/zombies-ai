
// find and replace MS with your initials (i.e. ABC)
// change this.name = "Your Chosen Name"

// only change code in selectAction function()

function MS(game) {
    this.player = 1;
    this.radius = 10;
    this.rocks = 0;
    this.kills = 0;
    this.name = "";
    this.color = "White";
    this.cooldown = 0;
    Entity.call(this, game, this.radius + Math.random() * (800 - this.radius * 2), this.radius + Math.random() * (800 - this.radius * 2));
	this.velocity = { x: 0, y: 0 };
};

MS.prototype = new Entity();
MS.prototype.constructor = MS;

// alter the code in this function to create your agent
// you may check the state but do not change the state of these variables:
//    this.rocks
//    this.cooldown
//    this.x
//    this.y
//    this.velocity
//    this.game and any of its properties

// you may access a list of zombies from this.game.zombies
// you may access a list of rocks from this.game.rocks
// you may access a list of players from this.game.players
MS.prototype.selectAction = function () {
	
	var action = { direction: { x: 0, y: 0 }, throwRock: false, target: null};
	var acceleration = 1000000;
	var closest = 1000;
	var target = null;
	this.visualRadius = 500;
	
	if (!this.rocks || this.cooldown) {
			for (var i = 0; i < this.game.zombies.length; i++) {
				var ent = this.game.zombies[i];
				var dist = distance(ent, this);
				if (dist < closest) {
					closest = dist;
					target = ent;
				}
				if (this.collide({x: ent.x, y: ent.y, radius: this.visualRadius})) {
					var difX = (ent.x - this.x) / dist;
					var difY = (ent.y - this.y) / dist;
					action.direction.x -= difX * acceleration / (dist * dist);
					action.direction.y -= difY * acceleration / (dist * dist);
				}
			}
			for (var i = 0; i < this.game.rocks.length; i++) {
				var ent = this.game.rocks[i];
				if (!ent.removeFromWorld && !ent.thrown && this.rocks < 2 && this.collide({ x: ent.x, y: ent.y, radius: this.visualRadius })) {
					var dist = distance(this, ent);
					if (dist > this.radius + ent.radius) {
						var difX = (ent.x - this.x) / dist;
						var difY = (ent.y - this.y) / dist;
						action.direction.x += difX * acceleration / (dist * dist);
						action.direction.y += difY * acceleration / (dist * dist);
					}
				}
			}
	} else {
		this.visualRadius = 5000;
		var worst;
		if (this.getAllies().length > 0) {
			worst = this.pickTarget();
		} else {
			worst = this.worstThreats()[0];
		}
		if (worst) {
			var dist = distance(this, worst);
			if (dist > this.radius + worst.radius) {
				var difX = (worst.x - this.x) / dist;
				var difY = (worst.y - this.y) / dist;
				action.direction.x += 5 * difX * acceleration / (dist * dist);
				action.direction.y += 5 * difY * acceleration / (dist * dist);
				this.target = worst;
			}
		}
		var zombies = this.game.zombies;
		zombies.sort(function(a,b) { return distance(this, a) - distance(this, b); });
		for (var i = 0; i < zombies.length; i++) {
			if (distance(this, zombies[i]) < this.radius + zombies[i].radius + 40) {
				action.throwRock = true;
				action.target = zombies[i];
				i = zombies.length;
			}
		}
		if (this.rocks < 2) {
			for (var i = 0; i < this.game.rocks.length; i++) {
				var ent = this.game.rocks[i];
				if (!ent.removeFromWorld && !ent.thrown && this.rocks < 2 && this.collide({ x: ent.x, y: ent.y, radius: this.visualRadius })) {
					var dist = distance(this, ent);
					if (dist > this.radius + ent.radius) {
						var difX = (ent.x - this.x) / dist;
						var difY = (ent.y - this.y) / dist;
						action.direction.x += difX * acceleration / (dist * dist);
						action.direction.y += difY * acceleration / (dist * dist);
					}
				}
			}
		}
	}
    return action;
};

MS.prototype.getAllies = function() {
	return this.game.players.filter(function(player) {
		return player.constructor == this.constructor;
	});
}

MS.prototype.pickTarget = function() {
	var player = this;
	var zombies = this.worstThreats();
	var players = this.getAllies();
	for (var i = 0; i < zombies.length; i++) {
		var zombie = zombies[i];
		players = players.sort(function(a,b) {
			return a.arrivalTime(zombie) - b.arrivalTime(zombie);
		});
		if (players[i] == this) {
			return zombie;
		} else {
			players = players.slice(1);
		}
	}
	return null;
}

MS.prototype.worstThreats = function() {
	var player = this;
	return this.game.zombies.filter(function(zombie) {
		return zombie.collide({x:player.x, y:player.y, radius:player.visualRadius});
	}).sort(function(a,b) {
		return player.arrivalTime(a) - player.arrivalTime(b);
	});
}

MS.prototype.arrivalTime = function(zombie) {
	return distance(this, zombie) / (zombie.maxSpeed);
}

// do not change code beyond this point

MS.prototype.collide = function (other) {
    return distance(this, other) < this.radius + other.radius;
};

MS.prototype.collideLeft = function () {
    return (this.x - this.radius) < 0;
};

MS.prototype.collideRight = function () {
    return (this.x + this.radius) > 800;
};

MS.prototype.collideTop = function () {
    return (this.y - this.radius) < 0;
};

MS.prototype.collideBottom = function () {
    return (this.y + this.radius) > 800;
};

MS.prototype.update = function () {
    Entity.prototype.update.call(this);
    // console.log(this.velocity);
    if (this.cooldown > 0) this.cooldown -= this.game.clockTick;
    if (this.cooldown < 0) this.cooldown = 0;
    this.action = this.selectAction();
    this.velocity.x += this.action.direction.x;
    this.velocity.y += this.action.direction.y;
	
    var speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
    if (speed > maxSpeed) {
        var ratio = maxSpeed / speed;
        this.velocity.x *= ratio;
        this.velocity.y *= ratio;
    }

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

    for (var i = 0; i < this.game.entities.length; i++) {
        var ent = this.game.entities[i];
        if (ent !== this && this.collide(ent)) {
            if (ent.name !== "Zombie" && ent.name !== "Rock") {
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
            if (ent.name === "Rock" && this.rocks < 2) {
                this.rocks++;
                ent.removeFromWorld = true;
            }
        }
    }
    

    if (this.cooldown === 0 && this.action.throwRock && this.rocks > 0) {
        this.cooldown = 1;
        this.rocks--;
        var target = this.action.target;
        var dir = direction(target, this);

        var rock = new Rock(this.game);
        rock.x = this.x + dir.x * (this.radius + rock.radius + 20);
        rock.y = this.y + dir.y * (this.radius + rock.radius + 20);
        rock.velocity.x = dir.x * rock.maxSpeed;
        rock.velocity.y = dir.y * rock.maxSpeed;
        rock.thrown = true;
        rock.thrower = this;
        this.game.addEntity(rock);
    }

    this.velocity.x -= (1 - friction) * this.game.clockTick * this.velocity.x;
    this.velocity.y -= (1 - friction) * this.game.clockTick * this.velocity.y;
};

MS.prototype.draw = function (ctx) {
    ctx.beginPath();
    ctx.fillStyle = this.color;
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fill();
    ctx.closePath();
};