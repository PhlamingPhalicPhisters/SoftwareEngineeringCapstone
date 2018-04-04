/*var game = new Phaser.Game(16*32, 600, Phaser.AUTO, document.getElementById('game'));
game.state.add('Game',Game);
game.state.start('Game');*/

var Game = {};

Game.init = function(){
    console.log('Game.init');

    // Disable scroll bars
    //document.documentElement.style.overflow = 'hidden'; // firefox, chrome
    //document.body.scroll = "no";    // ie only
    // Run game in background
    this.game.stage.disableVisibilityChange = true;
};


Game.preload = function() {
    console.log('Game.preload');

    this.game.load.tilemap('map', 'assets/map/example_map.json', null, Phaser.Tilemap.TILED_JSON);
    this.game.load.spritesheet('tileset', 'assets/map/tilesheet.png',32,32);
    this.game.load.image('background','assets/map/dark-space.png');
    this.game.load.image('sprite','assets/sprites/sprite.png'); // this will be the sprite of the players
    //this.game.load.image('sprite', 'assets/sprites/knuck.gif');
};
var sprite;
Game.create = function(){
    console.log('Game.create');

    var width = this.game.width;
    var height = this.game.height;

    // Create reference list of all players in game
    Game.playerMap = {};
    Game.allPlayersAdded = false;
    Game.localPlayerInstantiated = false;

    // Set the size of the playable game environment
    //game.world.setBounds(-width,-height,width*2,height*2);
    game.world.setBounds(0,0,2000,2000);
    var background = this.game.add.tileSprite(this.game.world.bounds.left,this.game.world.bounds.top,
        this.game.world.bounds.right, this.game.world.bounds.bottom,'background');
    this.game.stage.backgroundColor = '#ffffff';

    // Set up scaling management
    this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    this.game.scale.pageAlignHorizontally = true;
    this.game.scale.pageAlignVertically = true;
    // this.game.scale.setMinMax(640,480/*,1920,1080*/);

    // Handle window resizing events every 50ms
    window.addEventListener('resize',function(event){
        clearTimeout(window.resizedFinished);
        window.resizedFinished = setTimeout(function(){
            console.log('Resize finished');
            Game.rescale();
        }, 50);
    });

    //game.camera.width = window.width * 0.5;
    //game.camera.height = window.height * 0.5;

    // Set up tile mapping and layer system
    var map = this.game.add.tilemap('map');
    map.addTilesetImage('tilesheet', 'tileset'); // tilesheet is the key of the tileset in map's JSON file
    var layer;
    for(var i = 0; i < map.layers.length; i++) {
        layer = map.createLayer(i);
    }
    layer.inputEnabled = true; // Allows clicking on the map

    // Enable Phaser Arcade game physics engine
    this.game.physics.startSystem(Phaser.Physics.ARCADE);
    //this.game.physics.applyGravity = true;

    // Create Local player & all active remote players
    Client.askNewPlayer();

    // Set the game camera viewport bounds
    this.game.camera.bounds = new Phaser.Rectangle(-this.game.world.width,-this.game.world.height,
        this.game.world.width*3, this.game.world.height*3);

    // Enable inputs
    Game.cursors = this.game.input.keyboard.createCursorKeys();
    this.game.input.keyboard.addKeyCapture([Phaser.Keyboard.SPACEBAR]);

    layer.events.onInputUp.add(Game.getCoordinates, this);
};

Game.update = function()
{
    // Get forward/backward input
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
    }

    // Get left/right rotational input
    if (Game.cursors.left.isDown)
    {
        Client.sendRotation(-300);
    }
    else if (Game.cursors.right.isDown)
    {
        Client.sendRotation(300);
    }
    else
    {
        Client.sendRotation(0);
    }

    // Get firing input
    if (game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR))
    {
        Client.sendShoot();
    }

    // Sync the transform of remote instances of this player
    Game.sendTransform();
};

// Sync position and rotation of remote instances of player
Game.sendTransform = function()
{
    //console.log('Game sendTransform');
    if(Client.getPlayerID() != -1 && Game.localPlayerInstantiated/*&& Game.playerMap.length > 0*/) {
        var player = Game.playerMap[Client.getPlayerID()];
        Client.sendTransform(player.x, player.y, player.rotation);
    }
};

// Update the position and rotation of a given remote player
Game.updateTransform = function(id, x, y, rotation)
{
    if (Game.allPlayersAdded) {
        var player = Game.playerMap[id];
        player.x = x;
        player.y = y;
        player.rotation = rotation;
        Game.playerMap[id] = player;
    }
};

Game.removePlayer = function(id){
    console.log('Game.removePlayer');
    Game.playerMap[id].destroy();
    delete Game.playerMap[id];
};

Game.getCoordinates = function(layer, pointer) {
    Client.sendClick(pointer.worldX, pointer.worldY);
};

Game.movePlayer = function(id, x, y) {
    //console.log(Game.playerMap.length);
    var player = Game.playerMap[id];
    var distance = Phaser.Math.distance(player.x, player.y, x, y);
    var duration = distance * 1;
    this.game.tweens.remove(player.tween);
    var tween = game.add.tween(player);
    player.tween = tween;
    tween.to({x: x, y: y}, duration);
    tween.start();
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
};

Game.setPlayerRotation = function(id, angVelocity){
    Game.playerMap[id].body.angularVelocity = angVelocity;
};

Game.playerShoot = function(){

};

//Game.someGroup = Game.add.group();

Game.addNewPlayer = function(id,x,y,rotation){
    console.log('Game.addNewPlayer '+id);

    // Create player sprite instance
    var newPlayer = game.add.sprite(x,y,'sprite');
    // Set player sprite origin to center
    newPlayer.anchor.set(0.5);
    // Set starting rotation of player instance
    newPlayer.rotation = rotation;

    // Enable appropriate player physics
    this.game.physics.enable(newPlayer, Phaser.Physics.ARCADE);
    newPlayer.enableBody = true;
    newPlayer.body.collideWorldBounds = true;
    newPlayer.body.drag.set(100);
    newPlayer.body.maxVelocity.set(200);

    // Local player should be instantiated first before remote players
    Game.playerMap[id] = newPlayer;
    if (!Game.localPlayerInstantiated) {
        Game.localPlayerInstantiated = true;
    }

    // Set local camera to follow local player sprite
    this.game.camera.follow(Game.playerMap[Client.getPlayerID()], Phaser.Camera.FOLLOW_LOCKON);


    //Game.playerMap[id].tween;
    //Game.playerMap[id].body.immovable = true;
    //Game.someGroup.add(Game.playerMap[id]);
    //Game.physics.arcade.collide(Game.playerMap[id], Game.someGroup);
};

Game.setAllPlayersAdded = function(){
    Game.allPlayersAdded = true;
};

Game.rescale = function(){
    console.log('Rescaling game to '+window.innerWidth+'x'+window.innerHeight);
    this.game.scale.setGameSize(window.innerWidth, window.innerHeight);

    // // Make sure camera bounds are maintained
    this.game.camera.bounds = new Phaser.Rectangle(-this.game.world.width,-this.game.world.height,
        this.game.world.width*3, this.game.world.height*3);
};