/*var game = new Phaser.Game(16*32, 600, Phaser.AUTO, document.getElementById('game'));
game.state.add('Game',Game);
game.state.start('Game');*/

var Game = {};

Game.init = function(){
    game.stage.disableVisibilityChange = true;
};

Game.preload = function() {
    game.load.tilemap('map', 'assets/map/example_map.json', null, Phaser.Tilemap.TILED_JSON);
    game.load.spritesheet('tileset', 'assets/map/tilesheet.png',32,32);
    game.load.image('sprite','assets/sprites/sprite.png'); // this will be the sprite of the players
};

Game.create = function(){
    Game.playerMap = {};
    Game.map = game.add.tilemap('map');
    Game.map.addTilesetImage('tilesheet', 'tileset'); // tilesheet is the key of the tileset in map's JSON file

    for(var i = 0; i < Game.map.layers.length; i++) {
        Game.layer = Game.map.createLayer(i);
    }

    Game.layer.inputEnabled = true; // Allows clicking on the map
    Client.askNewPlayer();

    Game.physics.startSystem(Phaser.Physics.ARCADE);
    Game.playerGroup = Game.add.group();
    Game.layer.events.onInputUp.add(Game.getCoordinates, this);
   // Game.cursors = game.input.keyboard.createCursorKeys();
    Game.physics.arcade.gravity.y = -250;
};


Game.addNewPlayer = function(id,x,y){
    Game.playerMap[id] = game.add.sprite(x,y,'sprite');
    Game.physics.arcade.enable(Game.playerMap[id]);
    Game.playerMap[id].body.bounce.y = 0.2;
    Game.playerMap[id].body.immovable = true;
    Game.playerMap[id].body.collideWorldBounds = true;
    Game.playerGroup.add(Game.playerMap[id]);
    //Game.physics.arcade.collide(Game.playerMap[id], layerGroup[7]);
    Game.map.setCollisionBetween(Game.playerMap[id], 7);
    game.physics.arcade.collide(Game.playerMap[id], Game.map[7]);
    game.physics.enable(Game.playerMap[id]);
};

Game.getCoordinates = function(layer, pointer) {
    Client.sendClick(pointer.worldX, pointer.worldY);
};

/**Game.addCollisions = function(id){
    Game.physics.arcade.collide(Game.playerMap[id], layerGroup[7]);
}; */

Game.movePlayer = function(id, x, y) {
    x = x - 32;
    y = y - 32;
    var player = Game.playerMap[id];
    var distance = Phaser.Math.distance(player.x, player.y, x, y);
    var duration = distance * 10 ;
    var tween = game.add.tween(player);
    tween.to({x: x, y: y}, duration);
    tween.start();
};

Game.removePlayer = function(id){
    Game.playerMap[id].destroy();
    delete Game.playerMap[id];
};


