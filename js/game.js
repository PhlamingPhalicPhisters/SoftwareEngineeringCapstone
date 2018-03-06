/*var game = new Phaser.Game(16*32, 600, Phaser.AUTO, document.getElementById('game'));
game.state.add('Game',Game);
game.state.start('Game');*/

var Game = {};

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
    //this.game.load.image('sprite','assets/sprites/sprite.png'); // this will be the sprite of the players
    this.game.load.image('background','assets/map/dark-space.png');
    this.game.load.image('sprite', 'assets/sprites/knuck.gif');
};

Game.create = function(){
    var width = this.game.width;
    var height = this.game.height;
    console.log('Game.create');
    Game.playerMap = {};

    //game.world.setBounds(-width,-height,width*2,height*2);
    var background = this.game.add.tileSprite(0,0,
        this.game.world.width,this.game.world.height,'background');
    game.world.setBounds(0,0,1920,1920);
    this.game.stage.backgroundColor = '#000';

    this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;


    var map = this.game.add.tilemap('map');
    map.addTilesetImage('tilesheet', 'tileset'); // tilesheet is the key of the tileset in map's JSON file
    var layer;
    for(var i = 0; i < map.layers.length; i++) {
        layer = map.createLayer(i);
    }
    layer.inputEnabled = true; // Allows clicking on the map

    this.game.physics.startSystem(Phaser.Physics.ARCADE);
    //this.game.physics.applyGravity = true;
    Game.cursors = this.game.input.keyboard.createCursorKeys();

    Client.askNewPlayer();
    //this.game.camera.follow(Game.playerMap[Game.playerMap.length-1]);
    this.game.camera.follow(Game.localPlayer);
    layer.events.onInputUp.add(Game.getCoordinates, this);
};

Game.update = function()
{
    console.log('Game.update');
    //player.body.setZeroVelocity();

    if (Game.cursors.up.isDown)
    {
        Game.localPlayer.body.moveUp(300);
    }
    else if (Game.cursors.down.isDown)
    {
        Game.localPlayer.body.moveDown(300);
    }
    if (Game.cursors.left.isDown)
    {
        Game.localPlayer.body.velocity.x = -300;
    }
    else if (Game.cursors.right.isDown)
    {
        Game.localPlayer.body.moveRight(300);
    }
}

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
    x = x - Game.playerMap[id].width/2;
    y = y - Game.playerMap[id].height/2;
    var player = Game.playerMap[id];
    var distance = Phaser.Math.distance(player.x, player.y, x, y);
    var duration = distance * 1;
    this.game.tweens.remove(player.tween);
    var tween = game.add.tween(player);
    player.tween = tween;
    tween.to({x: x, y: y}, duration);
    tween.start();
};

//Game.someGroup = Game.add.group();

Game.addNewPlayer = function(id,x,y){
    Game.playerMap[id] = this.game.add.sprite(x,y,'sprite');

    if (Game.localPlayer === null)
    {
        Game.localPlayer = Game.playerMap[id];
    }

    this.game.physics.enable(Game.playerMap[id], Phaser.Physics.ARCADE);
    Game.playerMap[id].enableBody = true;

    //Game.playerMap[id].tween;
    //Game.playerMap[id].body.immovable = true;
    //Game.someGroup.add(Game.playerMap[id]);
    //Game.physics.arcade.collide(Game.playerMap[id], Game.someGroup);
};