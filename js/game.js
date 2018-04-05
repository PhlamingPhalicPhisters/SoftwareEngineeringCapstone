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
    this.game.load.image('background','assets/map/dark-space.png');
    this.game.load.image('sprite','assets/sprites/sprite.png'); // this will be the sprite of the players
    //this.game.load.image('bullet', 'assets/sprites/knuck.gif');
    this.game.load.image('bullet', 'assets/sprites/general-bullet.png');

};
var sprite;
var cursors;
var thisPlayer;
//var lastServerTime;

bulletInfo = {
    bulletTime: 0
};
publicBulletInfo = {
    bulletTime: 0
};
Game.create = function(){

    //***
    //*** Uncomment for optimization but make sure the background
    //*** outside of the map is not visible otherwise trippy shit happens
    //***
    //game.renderer.clearBeforeRender = false;
    //game.renderer.roundPixels = true;


    var width = this.game.width;
    var height = this.game.height;
    console.log('Game.create');
    Game.playerMap = {};
    Game.allPlayersAdded = false;
    Game.localPlayerInstantiated = false;

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

    Game.cursors = this.game.input.keyboard.addKeys( { 'up': Phaser.KeyCode.W, 'down': Phaser.KeyCode.S, 'left': Phaser.KeyCode.A, 'right': Phaser.KeyCode.D } );
    this.game.input.keyboard.addKeyCapture([Phaser.Keyboard.SPACEBAR]);

    //this.game.camera.follow(Game.playerMap[Game.playerMap.length-1]);
    //this.game.camera.follow(Game.localPlayer);
    //layer.events.onInputUp.add(Game.getCoordinates, this);

    /*sprite = this.game.add.sprite(100,100,'sprite');
    sprite.anchor.set(0.5);*/

    // Game.playerMap[id].anchor.x = 0.5;
    // Game.playerMap[id].anchor.y = 0.5;

    /*if (Game.localPlayer == null)
    {
        Game.localPlayer = Game.playerMap[id];
        this.game.camera.follow(Game.playerMap[id]);
    }*/

    /*this.game.physics.enable(sprite, Phaser.Physics.ARCADE);
    sprite.enableBody = true;
    sprite.body.collideWorldBounds = true;
    sprite.body.drag.set(100);
    sprite.body.maxVelocity.set(200);*/

    // Add ship's bullets
    bulletInfo.bullets = game.add.group();
    bulletInfo.bullets.enableBody = true;
    //bulletInfo.bullets.bodies.collideWorldBounds = true;
    bulletInfo.bullets.physicsBodyType = Phaser.Physics.ARCADE;

    // Add 69 bullets
    bulletInfo.bullets.createMultiple(69, 'bullet');
    bulletInfo.bullets.setAll('scale.x', 0.15);
    bulletInfo.bullets.setAll('scale.y', 0.15);
    bulletInfo.bullets.setAll('anchor.x', 0.5);
    bulletInfo.bullets.setAll('anchor.y', 0.5);

    // Add ship's bullets
    publicBulletInfo.bullets = game.add.group();
    publicBulletInfo.bullets.enableBody = true;
    publicBulletInfo.bullets.physicsBodyType = Phaser.Physics.ARCADE;

    // Add a lot of bullets
    publicBulletInfo.bullets.createMultiple(100, 'bullet');
    publicBulletInfo.bullets.setAll('scale.x', 0.15);
    publicBulletInfo.bullets.setAll('scale.y', 0.15);
    publicBulletInfo.bullets.setAll('anchor.x', 0.5);
    publicBulletInfo.bullets.setAll('anchor.y', 0.5);

    // Input
    /*cursors = game.input.keyboard.createCursorKeys();
    game.input.keyboard.addKeyCapture([Phaser.Keyboard.SPACEBAR]);*/




};

Game.update = function()
{
    //game.world.scale.refresh();
    //console.log('Game.update');
    //player.body.setZeroVelocity();

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
        //console.log('up');
        Client.sendAcceleration(1);
        // game.physics.arcade.accelerationFromRotation(Game.playerMap[Client.id].rotation,
        //     200, Game.playerMap[Client.id].body.acceleration);
    }
    else if (Game.cursors.down.isDown)
    {
        //console.log('down');
        Client.sendAcceleration(-1);
        // game.physics.arcade.accelerationFromRotation(Game.playerMap[Client.id].rotation,
        //     -200, Game.playerMap[Client.id].body.acceleration);
    }
    else
    {
        Client.sendAcceleration(0);
        // Game.playerMap[Client.id].body.acceleration.set(0);
    }
    if (Game.cursors.left.isDown && Game.cursors.right.isDown) {
        /*var angVelocity = Game.playerMap[Client.player.id].body.angularVelocity;// Game.playerMap[Client.id].body.angularVelocity = 300;
        if (Game.cursors.left.isDown && angVelocity < 0) {
            Client.sendRotation(-300);
        }
        else if (Game.cursors.left.isDown && angVelocity >= 0) {
            Client.sendRotation(-300);
            // Game.playerMap[Client.id].body.angularVelocity = -300;
        }
        else if (Game.cursors.right.isDown && angVelocity >= 0) {
            Client.sendRotation(300);
            // Game.playerMap[Client.id].body.angularVelocity = 300;
        }
        if (Game.cursors.right.isDown && angVelocity < 0) {
            Client.sendRotation(300);
        }*/
        if (Game.cursors.left.isDown && Game.cursors.left.timeDown > Game.cursors.right.timeDown) {
            Client.sendRotation(-300);
        }
        else {
            Client.sendRotation(300);
        }
    }
    else if (Game.cursors.left.isDown) {
        Client.sendRotation(-300);
    }
    else if (Game.cursors.right.isDown) {
        Client.sendRotation(300);
    }
    else
    {
        Client.sendRotation(0);
        // Game.playerMap[Client.id].body.angularVelocity = 0;
    }


    if (game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR))
    {
        //Client.sendShoot();
        //fireBullet(bulletInfo);
        fireBullet(bulletInfo);
    }

    Game.sendTransform();

    //screenWrap(sprite);

    //bullets.forEachExists(screenWrap, this);

    //console.log(Game.playerMap[0].x);
    //Client.sendTransform(Game.playerMap[Client.getPlayer()].x,
        //Game.playerMap[Client.getPlayer()].y,Game.playerMap[Client.getPlayer()].rotation);
};

/*
function fire() {

    Client.sendFire(bulletInfo);
}*/

function fireBullet(bulletInfo) {
    //console.log("fire");

    if (game.time.now > bulletInfo.bulletTime) {
        bulletInfo.bullet = bulletInfo.bullets.getFirstExists(false);

        if (bulletInfo.bullet) {
            bulletInfo.bullet.reset(Game.playerMap[Client.player.id].body.x + Game.playerMap[Client.player.id].width / 2, Game.playerMap[Client.player.id].body.y + Game.playerMap[Client.player.id].height / 2);
            //bullet.body.collideWorldBounds = true;
            bulletInfo.bullet.lifespan = 2000;
            bulletInfo.bullet.rotation = Game.playerMap[Client.player.id].rotation;
            game.physics.arcade.velocityFromRotation(Game.playerMap[Client.player.id].rotation, 1000, bulletInfo.bullet.body.velocity);
            bulletInfo.bulletTime = game.time.now + 50;
            //Client.sendFire(bulletInfo.bullet);
            Client.sendFire(Game.playerMap[Client.player.id].body.x, Game.playerMap[Client.player.id].body.y, Game.playerMap[Client.player.id].width, Game.playerMap[Client.player.id].height, Game.playerMap[Client.player.id].rotation);
        }
    }
}


Game.updateBullets = function(x, y, width, height, rotation, id, time) {
    /*if (avgPing == -1) {
        if (pingReceiveTimes.length == 0) {
            pingReceiveTimes = Client.getPingTimes();
        }
        if (pingReceiveTimes.length == 5) {
            var avg = 0;
            for (var i = 0; i < 5; i++) {
                avg += pingReceiveTimes[i]-pingSendTimes[i];
            }
            avgPing = avg / 5.0;
            //var lastServerTime = Game.serverStartTime + Game.time.now - avgPing;
            //var timeDiff = lastServerTime - time;
        }
    }
    console.log('ping: '+avgPing);
    var lastServerTime = Game.serverStartTime + game.time.now - avgPing/2;
    var timeDiff = lastServerTime - time;
    console.log('shoot time: '+time);
    console.log('receive time: '+lastServerTime);
    if (timeDiff <= 1000) {*/
    if (!document.hidden) {
        if (publicBulletInfo.bullets.length < 2)
            publicBulletInfo.bullets.create(100, 'bullet');
        publicBulletInfo.bullet = publicBulletInfo.bullets.getFirstExists(false);

        if (publicBulletInfo.bullet) {
            publicBulletInfo.bullet.reset(x + width / 2, y + height / 2);
            //bullet.body.collideWorldBounds = true;
            publicBulletInfo.bullet.lifespan = 2000;
            publicBulletInfo.bullet.rotation = rotation;
            game.physics.arcade.velocityFromRotation(rotation, 1000, publicBulletInfo.bullet.body.velocity);
            publicBulletInfo.bulletTime = game.time.now + 50;
            //Client.sendFire(Game.playerMap[Client.player.id].body.x, Game.playerMap[Client.player.id].body.y, Game.playerMap[Client.player.id].width, Game.playerMap[Client.player.id].height, Game.playerMap[Client.player.id].rotation);
        }
    }
};

function screenWrap (sprite) {
    if (sprite.x < 0) {
        sprite.x = game.width;
    }
    else if (sprite.x > game.width)
    {
        sprite.x = 0;
    }

    if (sprite.y < 0)
    {
        sprite.y = game.height;
    }
    else if (sprite.y > game.height)
    {
        sprite.y = 0;
    }
}

/*Game.addNewPlayer = function(id,x,y){
    Game.playerMap[id] = game.add.sprite(x-32,y-32,'sprite');
};*/

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

/*Game.updateTransform = function(id, x, y, rotation)
{
    Game.playerMap[id].x = x;
    Game.playerMap[id].y = y;
    Game.playerMap[id].rotation = rotation;
};*/

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
    console.log('Game.addNewPlayer '+id);

    var newPlayer = this.game.add.sprite(x,y,'sprite');

    newPlayer.anchor.set(0.5);

    // Game.playerMap[id].anchor.x = 0.5;
    // Game.playerMap[id].anchor.y = 0.5;

    /*if (Game.localPlayer == null)
    {
        Game.localPlayer = Game.playerMap[id];
        this.game.camera.follow(Game.playerMap[id]);
    }*/

    this.game.physics.enable(newPlayer, Phaser.Physics.ARCADE);
    newPlayer.enableBody = true;
    newPlayer.body.collideWorldBounds = true;
    newPlayer.body.drag.set(100);
    newPlayer.body.maxVelocity.set(200);

    //console.log('addNewPlayer body = '+newPlayer.body);

    //console.log('id: ' + id);

    Game.playerMap[id] = newPlayer;
    if (!Game.localPlayerInstantiated) {
        Game.localPlayerInstantiated = true;
    }
    //Game.ammoMap[id] = bulletInfo;

    this.game.camera.follow(Game.playerMap[Client.id], Phaser.Camera.FOLLOW_LOCKON);


    //Game.playerMap[id].tween;
    //Game.playerMap[id].body.immovable = true;
    //Game.someGroup.add(Game.playerMap[id]);
    //Game.physics.arcade.collide(Game.playerMap[id], Game.someGroup);
};

Game.setAllPlayersAdded = function(){
    Game.allPlayersAdded = true;
};