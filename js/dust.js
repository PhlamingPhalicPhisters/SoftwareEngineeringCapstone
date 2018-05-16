//this file handles the generation and removal of in game currency called "dust"
//it keeps a running list of all dust in the game

//List of all dust items in the game (client side)

var deathDustMap = new Map();
var deathDustID = 0;
var worldBoudndX = 6336;
var worldBoundY = 6336;
var dust = function (id, startx, starty, value) {

    //draw dust
    var dustObject = Game.add.sprite(startx, starty, 'dust');
    //dustObject.animations.add('float');
    //dustObject.animations.play('float', 10, true);
    //dustObject.scale.set(4);

    //define properties
    dustObject.id = id;
    //dustObject.positionx = startx;
    //dustObject.positiony = starty;
    dustObject.value = value;
    dustObject.width = 40;
    dustObject.height = 60;
    dustObject.enableBody = true;

    Game.physics.enable(dustObject, Phaser.Physics.ARCADE);
    dustObject.body.velocity.set(randomInt(-15,15), randomInt(-15,15));
    dustObject.body.angle = randomInt(-5,5);
    dustObject.body.collideWorldBounds = true;
    dustObject.body.bounce.setTo(1, 1);
    return dustObject;
};

var deathDust = function (id, startx, starty, value) {

ww};

//when dust is added
function addDust (id, x, y, value) {
    dustList.push(new dust(id, x, y, value));
}

//Instead of removing dust we just move it to a new location
function dustCollision(dustObject, player) {
    if(player.id === Client.id) {
        Client.sendCollect(dustObject.value);
    }
    moveDust(dustObject);
}

function dustCollisionDeath(dustObject) {
    Client.sendCollect(dustObject.value);
    deathDustMap.delete(dustObject.id);
    dustObject.destroy();
    delete dustObject;
}

function moveDust(dustObject){
    dustObject.x = randomInt(0,worldBoudndX);
    dustObject.y = randomInt(0,worldBoundY);
}

function generateDustForClient(){
    var bands = [0,0,0,0,0,0,0,0,0,0];
    //var rands = [];
    for(var i = 0; i < 150; i++) {
        var randNum = randomInt(0, 2560);
        var rand = randomInt(0, 4);
        //var randY = randomInt(0, 4);
        //console.log('randX: ' + randX + ' randY: ' + randY);
        var x = 0;
        var y = 0;
        const halfWorldSize = 3168;
        const halfSpawnSize = 200;
        const bandWidth = 300;
        //rands.push(randNum);
        if (randNum < 5) {
            bands[0]++;
            if (rand % 4 === 0) {
                x = randomInt(halfWorldSize - halfSpawnSize - bandWidth, halfWorldSize + halfSpawnSize + bandWidth);
                y = randomInt(halfWorldSize - halfSpawnSize - bandWidth, halfWorldSize - halfSpawnSize);
            }
            else if (rand % 4 === 1) {
                x = randomInt(halfWorldSize - halfSpawnSize - bandWidth, halfWorldSize + halfSpawnSize + bandWidth);
                y = randomInt(halfWorldSize + halfSpawnSize, halfWorldSize + halfSpawnSize + bandWidth);
            }
            else if (rand % 4 === 2) {
                x = randomInt(halfWorldSize + halfSpawnSize, halfWorldSize + halfSpawnSize + bandWidth);
                y = randomInt(halfWorldSize - halfSpawnSize, halfWorldSize + halfSpawnSize);
            }
            else {
                x = randomInt(halfWorldSize - halfSpawnSize - bandWidth, halfWorldSize - halfSpawnSize);
                y = randomInt(halfWorldSize - halfSpawnSize, halfWorldSize + halfSpawnSize);
            }
        }
        else if (randNum < 10) {
            bands[1]++;
            if (rand % 4 === 0) {
                x = randomInt(halfWorldSize - halfSpawnSize - 2*bandWidth, halfWorldSize + halfSpawnSize + 2*bandWidth);
                y = randomInt(halfWorldSize - halfSpawnSize - 2*bandWidth, halfWorldSize - halfSpawnSize - bandWidth);
            }
            else if (rand % 4 === 1) {
                x = randomInt(halfWorldSize - halfSpawnSize - 2*bandWidth, halfWorldSize + halfSpawnSize + 2*bandWidth);
                y = randomInt(halfWorldSize + halfSpawnSize + bandWidth, halfWorldSize + halfSpawnSize + 2*bandWidth);
            }
            else if (rand % 4 === 2) {
                x = randomInt(halfWorldSize + halfSpawnSize + bandWidth, halfWorldSize + halfSpawnSize + 2*bandWidth);
                y = randomInt(halfWorldSize - halfSpawnSize - bandWidth, halfWorldSize + halfSpawnSize + bandWidth);
            }
            else {
                x = randomInt(halfWorldSize - halfSpawnSize - 2*bandWidth, halfWorldSize - halfSpawnSize - bandWidth);
                y = randomInt(halfWorldSize - halfSpawnSize - bandWidth, halfWorldSize + halfSpawnSize + bandWidth);
            }
        }
        else if (randNum < 20) {
            bands[2]++;
            if (rand % 4 === 0) {
                x = randomInt(halfWorldSize - halfSpawnSize - 3*bandWidth, halfWorldSize + halfSpawnSize + 3*bandWidth);
                y = randomInt(halfWorldSize - halfSpawnSize - 3*bandWidth, halfWorldSize - halfSpawnSize - 2*bandWidth);
            }
            else if (rand % 4 === 1) {
                x = randomInt(halfWorldSize - halfSpawnSize - 3*bandWidth, halfWorldSize + halfSpawnSize + 3*bandWidth);
                y = randomInt(halfWorldSize + halfSpawnSize + 2*bandWidth, halfWorldSize + halfSpawnSize + 3*bandWidth);
            }
            else if (rand % 4 === 2) {
                x = randomInt(halfWorldSize + halfSpawnSize + 2*bandWidth, halfWorldSize + halfSpawnSize + 3*bandWidth);
                y = randomInt(halfWorldSize - halfSpawnSize - 2*bandWidth, halfWorldSize + halfSpawnSize + 2*bandWidth);
            }
            else {
                x = randomInt(halfWorldSize - halfSpawnSize - 3*bandWidth, halfWorldSize - halfSpawnSize - 2*bandWidth);
                y = randomInt(halfWorldSize - halfSpawnSize - 2*bandWidth, halfWorldSize + halfSpawnSize + 2*bandWidth);
            }
        }
        else if (randNum < 40) {
            bands[3]++;
            if (rand % 4 === 0) {
                x = randomInt(halfWorldSize - halfSpawnSize - 4*bandWidth, halfWorldSize + halfSpawnSize + 4*bandWidth);
                y = randomInt(halfWorldSize - halfSpawnSize - 4*bandWidth, halfWorldSize - halfSpawnSize - 3*bandWidth);
            }
            else if (rand % 4 === 1) {
                x = randomInt(halfWorldSize - halfSpawnSize - 4*bandWidth, halfWorldSize + halfSpawnSize + 4*bandWidth);
                y = randomInt(halfWorldSize + halfSpawnSize + 3*bandWidth, halfWorldSize + halfSpawnSize + 4*bandWidth);
            }
            else if (rand % 4 === 2) {
                x = randomInt(halfWorldSize + halfSpawnSize + 3*bandWidth, halfWorldSize + halfSpawnSize + 4*bandWidth);
                y = randomInt(halfWorldSize - halfSpawnSize - 3*bandWidth, halfWorldSize + halfSpawnSize + 3*bandWidth);
            }
            else {
                x = randomInt(halfWorldSize - halfSpawnSize - 4*bandWidth, halfWorldSize - halfSpawnSize - 3*bandWidth);
                y = randomInt(halfWorldSize - halfSpawnSize - 3*bandWidth, halfWorldSize + halfSpawnSize + 3*bandWidth);
            }
        }
        else if (randNum < 80) {
            bands[4]++;
            if (rand % 4 === 0) {
                x = randomInt(halfWorldSize - halfSpawnSize - 5*bandWidth, halfWorldSize + halfSpawnSize + 5*bandWidth);
                y = randomInt(halfWorldSize - halfSpawnSize - 5*bandWidth, halfWorldSize - halfSpawnSize - 4*bandWidth);
            }
            else if (rand % 4 === 1) {
                x = randomInt(halfWorldSize - halfSpawnSize - 5*bandWidth, halfWorldSize + halfSpawnSize + 5*bandWidth);
                y = randomInt(halfWorldSize + halfSpawnSize + 4*bandWidth, halfWorldSize + halfSpawnSize + 5*bandWidth);
            }
            else if (rand % 4 === 2) {
                x = randomInt(halfWorldSize + halfSpawnSize + 4*bandWidth, halfWorldSize + halfSpawnSize + 5*bandWidth);
                y = randomInt(halfWorldSize - halfSpawnSize - 4*bandWidth, halfWorldSize + halfSpawnSize + 4*bandWidth);
            }
            else {
                x = randomInt(halfWorldSize - halfSpawnSize - 5*bandWidth, halfWorldSize - halfSpawnSize - 4*bandWidth);
                y = randomInt(halfWorldSize - halfSpawnSize - 4*bandWidth, halfWorldSize + halfSpawnSize + 4*bandWidth);
            }
        }
        else if (randNum < 160) {
            bands[5]++;
            if (rand % 4 === 0) {
                x = randomInt(halfWorldSize - halfSpawnSize - 6*bandWidth, halfWorldSize + halfSpawnSize + 6*bandWidth);
                y = randomInt(halfWorldSize - halfSpawnSize - 6*bandWidth, halfWorldSize - halfSpawnSize - 5*bandWidth);
            }
            else if (rand % 4 === 1) {
                x = randomInt(halfWorldSize - halfSpawnSize - 6*bandWidth, halfWorldSize + halfSpawnSize + 6*bandWidth);
                y = randomInt(halfWorldSize + halfSpawnSize + 5*bandWidth, halfWorldSize + halfSpawnSize + 6*bandWidth);
            }
            else if (rand % 4 === 2) {
                x = randomInt(halfWorldSize + halfSpawnSize + 5*bandWidth, halfWorldSize + halfSpawnSize + 6*bandWidth);
                y = randomInt(halfWorldSize - halfSpawnSize - 5*bandWidth, halfWorldSize + halfSpawnSize + 5*bandWidth);
            }
            else {
                x = randomInt(halfWorldSize - halfSpawnSize - 6*bandWidth, halfWorldSize - halfSpawnSize - 5*bandWidth);
                y = randomInt(halfWorldSize - halfSpawnSize - 5*bandWidth, halfWorldSize + halfSpawnSize + 5*bandWidth);
            }
        }
        else if (randNum < 320) {
            bands[6]++;
            if (rand % 4 === 0) {
                x = randomInt(halfWorldSize - halfSpawnSize - 7*bandWidth, halfWorldSize + halfSpawnSize + 7*bandWidth);
                y = randomInt(halfWorldSize - halfSpawnSize - 7*bandWidth, halfWorldSize - halfSpawnSize - 6*bandWidth);
            }
            else if (rand % 4 === 1) {
                x = randomInt(halfWorldSize - halfSpawnSize - 7*bandWidth, halfWorldSize + halfSpawnSize + 7*bandWidth);
                y = randomInt(halfWorldSize + halfSpawnSize + 6*bandWidth, halfWorldSize + halfSpawnSize + 7*bandWidth);
            }
            else if (rand % 4 === 2) {
                x = randomInt(halfWorldSize + halfSpawnSize + 6*bandWidth, halfWorldSize + halfSpawnSize + 7*bandWidth);
                y = randomInt(halfWorldSize - halfSpawnSize - 6*bandWidth, halfWorldSize + halfSpawnSize + 6*bandWidth);
            }
            else {
                x = randomInt(halfWorldSize - halfSpawnSize - 7*bandWidth, halfWorldSize - halfSpawnSize - 6*bandWidth);
                y = randomInt(halfWorldSize - halfSpawnSize - 6*bandWidth, halfWorldSize + halfSpawnSize + 6*bandWidth);
            }
        }
        else if (randNum < 640) {
            bands[7]++;
            if (rand % 4 === 0) {
                x = randomInt(halfWorldSize - halfSpawnSize - 8*bandWidth, halfWorldSize + halfSpawnSize + 8*bandWidth);
                y = randomInt(halfWorldSize - halfSpawnSize - 8*bandWidth, halfWorldSize - halfSpawnSize - 7*bandWidth);
            }
            else if (rand % 4 === 1) {
                x = randomInt(halfWorldSize - halfSpawnSize - 8*bandWidth, halfWorldSize + halfSpawnSize + 8*bandWidth);
                y = randomInt(halfWorldSize + halfSpawnSize + 7*bandWidth, halfWorldSize + halfSpawnSize + 8*bandWidth);
            }
            else if (rand % 4 === 2) {
                x = randomInt(halfWorldSize + halfSpawnSize + 7*bandWidth, halfWorldSize + halfSpawnSize + 8*bandWidth);
                y = randomInt(halfWorldSize - halfSpawnSize - 7*bandWidth, halfWorldSize + halfSpawnSize + 7*bandWidth);
            }
            else {
                x = randomInt(halfWorldSize - halfSpawnSize - 8*bandWidth, halfWorldSize - halfSpawnSize - 7*bandWidth);
                y = randomInt(halfWorldSize - halfSpawnSize - 7*bandWidth, halfWorldSize + halfSpawnSize + 7*bandWidth);
            }
        }
        else if (randNum < 1280) {
            bands[8]++;
            if (rand % 4 === 0) {
                x = randomInt(halfWorldSize - halfSpawnSize - 9*bandWidth, halfWorldSize + halfSpawnSize + 9*bandWidth);
                y = randomInt(halfWorldSize - halfSpawnSize - 9*bandWidth, halfWorldSize - halfSpawnSize - 8*bandWidth);
            }
            else if (rand % 4 === 1) {
                x = randomInt(halfWorldSize - halfSpawnSize - 9*bandWidth, halfWorldSize + halfSpawnSize + 9*bandWidth);
                y = randomInt(halfWorldSize + halfSpawnSize + 8*bandWidth, halfWorldSize + halfSpawnSize + 9*bandWidth);
            }
            else if (rand % 4 === 2) {
                x = randomInt(halfWorldSize + halfSpawnSize + 8*bandWidth, halfWorldSize + halfSpawnSize + 9*bandWidth);
                y = randomInt(halfWorldSize - halfSpawnSize - 8*bandWidth, halfWorldSize + halfSpawnSize + 8*bandWidth);
            }
            else {
                x = randomInt(halfWorldSize - halfSpawnSize - 9*bandWidth, halfWorldSize - halfSpawnSize - 8*bandWidth);
                y = randomInt(halfWorldSize - halfSpawnSize - 8*bandWidth, halfWorldSize + halfSpawnSize + 8*bandWidth);
            }
        }
        else {
            bands[9]++;
            if (rand % 4 === 0) {
                x = randomInt(halfWorldSize - halfSpawnSize - 10*bandWidth + 32, halfWorldSize + halfSpawnSize + 10*bandWidth - 32);
                y = randomInt(halfWorldSize - halfSpawnSize - 10*bandWidth + 32, halfWorldSize - halfSpawnSize - 9*bandWidth);
            }
            else if (rand % 4 === 1) {
                x = randomInt(halfWorldSize - halfSpawnSize - 10*bandWidth + 32, halfWorldSize + halfSpawnSize + 10*bandWidth - 32);
                y = randomInt(halfWorldSize + halfSpawnSize + 9*bandWidth, halfWorldSize + halfSpawnSize + 10*bandWidth - 32);
            }
            else if (rand % 4 === 2) {
                x = randomInt(halfWorldSize + halfSpawnSize + 9*bandWidth, halfWorldSize + halfSpawnSize + 10*bandWidth - 32);
                y = randomInt(halfWorldSize - halfSpawnSize - 9*bandWidth, halfWorldSize + halfSpawnSize + 9*bandWidth);
            }
            else {
                x = randomInt(halfWorldSize - halfSpawnSize - 10*bandWidth+32, halfWorldSize - halfSpawnSize - 9*bandWidth);
                y = randomInt(halfWorldSize - halfSpawnSize - 9*bandWidth, halfWorldSize + halfSpawnSize + 9*bandWidth);
            }
        }
        addDust(i, x, y, 100);
    }
    for (var i = 0; i < 10; i++) {
        console.log(i + ': ' + bands[i]);
    }
}

function generateDustOnDeath(x,y, amount) {
    var dropAmount = amount / 100;
    console.log("player x: " + x + ", player y: " + y);
    for(var i = 0;  i < dropAmount; i++){
        deathDustMap.set(deathDustID,
            new deathDust(deathDustID++,randomInt(x - 10, x + 10), randomInt(y - 10, y + 10), 70));
        //randomInt(x - 10, x + 10), randomInt(y - 10, y + 10)
    }
}

function randomInt (low, high) {
    return Math.floor(Math.random() * (high - low) + low);
}