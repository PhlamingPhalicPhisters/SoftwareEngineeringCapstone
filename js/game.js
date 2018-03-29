/*var game = new Phaser.Game(16*32, 600, Phaser.AUTO, document.getElementById('game'));
game.state.add('Game',Game);
game.state.start('Game');*/

var Game = {};

var playerArray = [];

Game.init = function(){
    console.log('Game.init');
    // Disable scroll bars
    //document.documentElement.style.overflow = 'hidden'; // firefox, chrome
    //document.body.scroll = "no";    // ie only
    // Stretch to fill
    this.game.stage.disableVisibilityChange = true;
};


Game.preload = function() {
    console.log('Game.preload');
    this.game.load.tilemap('map', 'assets/map/example_map.json', null, Phaser.Tilemap.TILED_JSON);
    this.game.load.spritesheet('tileset', 'assets/map/tilesheet.png',32,32);
    this.game.load.image('background','assets/map/dark-space.png');
    this.game.load.image('sprite','assets/sprites/sprite.png'); // this will be the sprite of the players
    //this.game.load.image('sprite', 'assets/sprites/knuck.gif');
    this.game.load.image('panda','assets/sprites/panda.png');
};
var sprite1;
var sprite2;
var spriteGroup;
Game.create = function(){
    var width = this.game.width;
    var height = this.game.height;
    console.log('Game.create');
    Game.playerMap = {};

    //game.world.setBounds(-width,-height,width*2,height*2);
    game.world.setBounds(0,0,2000,2000);
    var background = this.game.add.tileSprite(this.game.world.bounds.left,this.game.world.bounds.top,
        this.game.world.bounds.right, this.game.world.bounds.bottom,'background');
    this.game.stage.backgroundColor = '#ffffff';

    this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    // this.scale.pageAlignHorizontally = true;
    // this.scale.pageAlignVertically = true;
    // this.scale.setScreenSize(true);
    //game.camera.width = window.width * 0.5;
    //game.camera.height = window.height * 0.5;

    var map = this.game.add.tilemap('map');
    map.addTilesetImage('tilesheet', 'tileset'); // tilesheet is the key of the tileset in map's JSON file
    var layer;
    for(var i = 0; i < map.layers.length; i++) {
        layer = map.createLayer(i);
    }
    layer.inputEnabled = true; // Allows clicking on the map

    this.game.physics.startSystem(Phaser.Physics.ARCADE);
    //this.game.physics.applyGravity = true;

    Client.askNewPlayer();

    Client.getPlayer();

    this.game.camera.bounds = new Phaser.Rectangle(-this.game.world.width,-this.game.world.height,
        this.game.world.width*3, this.game.world.height*3);

    Game.cursors = this.game.input.keyboard.createCursorKeys();
    this.game.input.keyboard.addKeyCapture([Phaser.Keyboard.SPACEBAR]);

    //this.game.camera.follow(Game.playerMap[Game.playerMap.length-1]);
    //this.game.camera.follow(Game.localPlayer);
    layer.events.onInputUp.add(Game.getCoordinates, this);

    sprite1 = game.add.sprite(200, 200, 'sprite');
    sprite1.name = 'sprite';
    Game.physics.enable(sprite1, Phaser.Physics.ARCADE);
    sprite1.body.collideWorldBounds = true;
    sprite1.body.immovable = false;
    sprite1.body.setSize(26, 32, 13, 16);
    sprite1.body.bounce.setTo(.5, .5);
    sprite2 = game.add.sprite(250, 250, 'sprite');
    sprite2.name = 'sprite';
    Game.physics.enable(sprite2, Phaser.Physics.ARCADE);
    sprite2.body.collideWorldBounds = true;
    sprite2.body.immovable = false;
    sprite2.body.setSize(26, 32, 13, 16);
    sprite2.body.bounce.setTo(.5, .5);
    spriteGroup = [sprite1, sprite2];
    //sprite1.anchor.setTo(0.5, 0.5);

    //sprite = this.game.add.sprite(100,100,'sprite');
   // sprite.anchor.set(0.5);

    // Game.playerMap[id].anchor.x = 0.5;
    // Game.playerMap[id].anchor.y = 0.5;

    /*if (Game.localPlayer == null)
    {
        Game.localPlayer = Game.playerMap[id];
        this.game.camera.follow(Game.playerMap[id]);
    }*/

    //this.game.physics.enable(sprite, Phaser.Physics.ARCADE);
    //sprite.enableBody = true;
    //sprite.body.collideWorldBounds = true;
    //sprite.body.drag.set(100);
    //sprite.body.maxVelocity.set(200);


};

Game.update = function()
{

    //game.world.scale.refresh();
    console.log(playerArray.length);
    //player.body.setZeroVelocity();
    Game.physics.arcade.collide(playerArray, playerArray);
    Game.physics.arcade.collide(spriteGroup, Game.playerMap[Client.id]);

    //this.game.physics.enable(Game.playerMap[Client.id], Phaser.Physics.ARCADE);

    //console.log('addNewPlayer body = '+sprite.body);
    /*if (Game.cursors.up.isDown)
    {
        game.physics.arcade.accelerationFromRotation(sprite.rotation,
            200, sprite.body.acceleration);
    }
    else
    {
        sprite.body.acceleration.set(0);
    }

    if (Game.cursors.left.isDown)
    {
        sprite.body.angularVelocity = -300;
    }
    else if (Game.cursors.right.isDown)
    {
        sprite.body.angularVelocity = 300;
    }
    else
    {
        sprite.body.angularVelocity = 0;
    }

    if (game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR))
    {
        //fireBullet();
    }*/

    if (Game.cursors.up.isDown)
    {
        Client.sendAcceleration(1);
        // game.physics.arcade.accelerationFromRotation(Game.playerMap[Client.id].rotation,
        //     200, Game.playerMap[Client.id].body.acceleration);
    }
    else if (Game.cursors.down.isDown)
    {
        Client.sendAcceleration(-1);
        // game.physics.arcade.accelerationFromRotation(Game.playerMap[Client.id].rotation,
        //     -200, Game.playerMap[Client.id].body.acceleration);
    }
    else
    {
        Client.sendAcceleration(0);
        // Game.playerMap[Client.id].body.acceleration.set(0);
    }

    if (Game.cursors.left.isDown)
    {
        Client.sendRotation(-300);
        // Game.playerMap[Client.id].body.angularVelocity = -300;
    }
    else if (Game.cursors.right.isDown)
    {
        Client.sendRotation(300);
        // Game.playerMap[Client.id].body.angularVelocity = 300;
    }
    else
    {
        Client.sendRotation(0);
        // Game.playerMap[Client.id].body.angularVelocity = 0;
    }

    if (game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR))
    {
        Client.sendShoot();
        //fireBullet();
    }

    //console.log(Game.playerMap[0].x);
    //Client.sendTransform(Game.playerMap[Client.getPlayer()].x,
    //Game.playerMap[Client.getPlayer()].y,Game.playerMap[Client.getPlayer()].rotation);
};

/*Game.addNewPlayer = function(id,x,y){
    Game.playerMap[id] = game.add.sprite(x-32,y-32,'sprite');
};*/

Game.removePlayer = function(id){
    console.log('Game.removePlayer');
    Game.playerMap[id].destroy();
    delete Game.playerMap[id];
};

Game.getCoordinates = function(layer, pointer) {
    Client.sendClick(pointer.worldX, pointer.worldY);
};

Game.movePlayer = function(id, x, y) {
    // x = x - Game.playerMap[id].width/2;
    // y = y - Game.playerMap[id].height/2;
    /*if (x < 0 && y < 0) {
        return;
    }
    else if (x < 0) {
        x = 0;
    }
    else if (y < 0) {
        y = 0;
    }
    if (x > this.game.world.width && y > this.game.world.height) {
        return;
    }
    else if (x > this.game.world.width) {
        x = this.game.world.width;
    }
    else if (y > this.game.world.height) {
        y = this.game.world.height;
    }*/
    var player = Game.playerMap[id];
    var distance = Phaser.Math.distance(player.x, player.y, x, y);
    var duration = distance * 1;
    this.game.tweens.remove(player.tween);
    var tween = game.add.tween(player);
    player.tween = tween;
    tween.to({x: x, y: y}, duration);
    tween.start();
};

Game.updateTransform = function(id, x, y, rotation)
{
    Game.playerMap[id].x = x;
    Game.playerMap[id].y = y;
    Game.playerMap[id].rotation = rotation;
};

Game.setPlayerAcceleration = function(id, direction){
    if (direction == 1)
    {
        game.physics.arcade.accelerationFromRotation(Game.playerMap[id].rotation,
            200, Game.playerMap[id].body.acceleration);
    }
    else if (direction == -1)
    {
        game.physics.arcade.accelerationFromRotation(Game.playerMap[id].rotation,
            -200, Game.playerMap[id].body.acceleration);
    }
    else
    {
        Game.playerMap[id].body.acceleration.set(0);
    }
}

Game.setPlayerRotation = function(id, angVelocity){
    Game.playerMap[id].body.angularVelocity = angVelocity;
}

Game.playerShoot = function(){

}

//Game.someGroup = Game.add.group();

Game.addNewPlayer = function(id,x,y){
    var newPlayer = Game.add.sprite(x,y,'sprite');

    newPlayer.anchor.set(0.5);

    // Game.playerMap[id].anchor.x = 0.5;
    // Game.playerMap[id].anchor.y = 0.5;

    /*if (Game.localPlayer == null)
    {
        Game.localPlayer = Game.playerMap[id];
        this.game.camera.follow(Game.playerMap[id]);
    }*/

    Game.physics.enable(newPlayer, Phaser.Physics.ARCADE);
    newPlayer.enableBody = true;                            //Here is what is needed for
    newPlayer.body.collideWorldBounds = true;
    newPlayer.body.setSize(26, 32, 13, 16);                   //collisions to work
    newPlayer.body.bounce.setTo(.5, .5);
    newPlayer.body.drag.set(100);
    newPlayer.body.maxVelocity.set(200);

    console.log('addNewPlayer body = '+newPlayer.body);

    //console.log('id: ' + id);

    Game.playerMap[id] = newPlayer;
    playerArray.push(newPlayer);

    this.game.camera.follow(Game.playerMap[Client.id], Phaser.Camera.FOLLOW_LOCKON);


    //Game.playerMap[id].tween;
    //Game.playerMap[id].body.immovable = true;
    //Game.someGroup.add(Game.playerMap[id]);
    //Game.physics.arcade.collide(Game.playerMap[id], Game.someGroup);
};