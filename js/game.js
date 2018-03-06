/*var game = new Phaser.Game(16*32, 600, Phaser.AUTO, document.getElementById('game'));
game.state.add('Game',Game);
game.state.start('Game');*/

var Game = {};

Game.init = function(){
    game.stage.disableVisibilityChange = true;
};

Game.preload = function() {
    game.load.tilemap('map', 'assets/map/example_map.json', null, Phaser.Tilemap.TILED_JSON);
    game.load.spritesheet('tileset', 'assets/map/tilesheet.png',64,64);
    //game.load.image('sprite','assets/sprites/sprite.png'); // this will be the sprite of the players
    game.load.image('sprite', 'assets/sprites/knuck.gif');
};

Game.create = function(){
    Game.playerMap = {};
    var map = game.add.tilemap('map');
    map.addTilesetImage('tilesheet', 'tileset'); // tilesheet is the key of the tileset in map's JSON file
    var layer;
    for(var i = 0; i < map.layers.length; i++) {
        layer = map.createLayer(i);
    }
    //Game.physics.enable(p);

    //Game.physics.arcade.gravity.y = 250;
    layer.inputEnabled = true; // Allows clicking on the map
    Client.askNewPlayer();
    layer.events.onInputUp.add(Game.getCoordinates, this);
};

Game.removePlayer = function(id){
    Game.playerMap[id].destroy();
    delete Game.playerMap[id];
};

Game.getCoordinates = function(layer, pointer) {
    Client.sendClick(pointer.worldX, pointer.worldY);
};

Game.movePlayer = function(id, x, y) {
    x = x - 32;
    y = y - 32;
    var player = Game.playerMap[id];
    var distance = Phaser.Math.distance(player.x, player.y, x, y);
    var duration = distance * 1;
    game.tweens.remove(player.tween);
    var tween = game.add.tween(player);
    player.tween = tween;
    tween.to({x: x, y: y}, duration);
    tween.start();
};

Game.addNewPlayer = function(id,x,y){
    Game.playerMap[id] = game.add.sprite(x,y,'sprite');
    Game.physics.arcade.enable(Game.playerMap[id]);
    Game.playerMap[id].enableBody = true;
    //Game.playerMap[id].tween;
    //Game.playerMap[id].body.immovable = true;
    //Game.someGroup.add(Game.playerMap[id]);
    //Game.physics.arcade.collide(Game.playerMap[id], Game.someGroup);
};