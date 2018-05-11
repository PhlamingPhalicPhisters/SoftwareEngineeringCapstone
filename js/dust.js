//this file handles the generation and removal of in game currency called "dust"
//it keeps a running list of all dust in the game

//List of all dust items in the game (client side)
var dustList = [];
var worldBoudndX = 6336;
var worldBoundY = 6336;
var dust = function (id, startx, starty, value) {

    //draw dust
    var dustObject = game.add.sprite(startx, starty, 'dust');
    //dustObject.animations.add('float');
    //dustObject.animations.play('float', 10, true);
    //dustObject.scale.set(4);

    //define properties
    dustObject.id = id;
    dustObject.positionx = startx;
    dustObject.positiony = starty;
    dustObject.value = value;
    dustObject.width = 40;
    dustObject.height = 60;
    dustObject.enableBody = true;

    Game.physics.enable(dustObject, Phaser.Physics.ARCADE);

    return dustObject;
}

//when dust is added
function addDust (id, x, y, value) {
    dustList.push(new dust(id, x, y, value));
}

//Instead of removing dust we just move it to a new location
function dustCollision(dustObject) {
    Client.sendCollect(100);
    moveDust(dustObject);
}
function moveDust(dustObject){
    dustObject.x = randomInt(0,worldBoudndX);
    dustObject.y = randomInt(0,worldBoundY);
}

function generateDustForClient(){
    for(var i = 0; i < 150; i++) {
        addDust(i, randomInt(0,worldBoudndX), randomInt(0,worldBoundY), 100);
    }
}

function generateDustOnDeath(x,y) {
    var dropAmount = randomInt(0, 8);
    for(var i = 0;  i < dropAmount; i++){
        dust(0, x + i, y + i, 70);
    }
}

function randomInt (low, high) {
    return Math.floor(Math.random() * (high - low) + low);
}