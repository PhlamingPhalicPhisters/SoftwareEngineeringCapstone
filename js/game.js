/*var game = new Phaser.Game(16*32, 600, Phaser.AUTO, document.getElementById('game'));
game.state.add('Game',Game);
game.state.start('Game');*/
var Game = {};

var playerArray = [];

var layer;
var bmd;
var playerHUD = {
    "health": 0,
    "bullets": 0,
    "boost": 0,
    "currency": 0
};
//This variable represents the amount of ships in the game
//It is used when assigning new players a ship
const numberOfShipSprites = 8;

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

    this.game.load.tilemap('map', 'assets/map/uncompressedmap.json', null, Phaser.Tilemap.TILED_JSON);
    this.game.load.image('tiles', 'assets/map/simples_pimples.png');
    this.game.load.image('background','assets/map/dark-space.png');
    this.game.load.image('ship1','assets/sprites/ship1.png');
    this.game.load.image('ship2','assets/sprites/ship2.png');
    this.game.load.image('ship3','assets/sprites/ship3.png');
    this.game.load.image('ship4','assets/sprites/ship4.png');
    this.game.load.image('ship5','assets/sprites/ship5.png');
    this.game.load.image('ship6','assets/sprites/ship6.png');
    this.game.load.image('ship7','assets/sprites/ship7.png');
    this.game.load.image('ship8','assets/sprites/ship8.png');
    this.game.load.image('SAOHealth','assets/sprites/SAOHealth.png');
    //this.game.load.image('sprite', 'assets/sprites/knuck.gif');

    //this.game.load.image('sprite','assets/sprites/sprite.png'); // this will be the sprite of the players
    //this.game.load.image('bullet', 'assets/sprites/knuck.gif');
    this.game.load.image('bullet', 'assets/sprites/general-bullet.png');

};
var sprite;
var cursors;
var thisPlayer;
//var lastServerTime;
var shield;

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

    // Enable Phaser Arcade game physics engine
    //this.game.physics.startSystem(Phaser.Physics.ARCADE);
    Game.physics.startSystem(Phaser.Physics.ARCADE);

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
    map.addTilesetImage('tiles128','tiles'); // tilesheet is the key of the tileset in map's JSON file
    layer = map.createLayer('GroundLayer');
    map.setCollisionBetween(0, 4000, true, 'GroundLayer');

    //for(var i = 0; i < map.layers.length; i++) {
        //layer = map.createLayer(i);
    //}

    layer.inputEnabled = true; // Allows clicking on the map

    // Enable Phaser Arcade game physics engine
    this.game.physics.startSystem(Phaser.Physics.ARCADE);
    //this.game.physics.applyGravity = true;

    // Create Local player & all active remote players
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
    //bulletInfo.bullets.bodies.collideWorldBounds = true;
    bulletInfo.bullets.physicsBodyType = Phaser.Physics.ARCADE;
    bulletInfo.bullets.enableBody = true;

    // Add 69 bullets
    bulletInfo.bullets.createMultiple(69, 'bullet');
    bulletInfo.bullets.setAll('scale.x', 0.15);
    bulletInfo.bullets.setAll('scale.y', 0.15);

   // console.log("good");
    //shield = this.game.add.text(0, 0, 'Shield: ' + playerHUD["health"] +'%', { font: '20px Arial', fill: '#fff' });
    //console.log("first shield x, y" + shield.x + ", " + shield.y);

    //bulletInfo.bullets.bodies.setCircle(10);
    bulletInfo.bullets.setAll('anchor.x', 0.5);
    bulletInfo.bullets.setAll('anchor.y', 0.5);
    //bulletInfo.bullets.body.setSize(10, 10, 5, 5);
   // bulletInfo.bullets.body.bounce.setTo(1, 1);

  //  console.log("good");
    // Add ship's bullets
    publicBulletInfo.bullets = game.add.group();
    publicBulletInfo.bullets.physicsBodyType = Phaser.Physics.ARCADE;
    publicBulletInfo.bullets.enableBody = true;

    // Add a lot of bullets
    publicBulletInfo.bullets.createMultiple(100, 'bullet');
    publicBulletInfo.bullets.setAll('scale.x', 0.15);
    publicBulletInfo.bullets.setAll('scale.y', 0.15);

    //publicBulletInfo.bullets.bodies.setCircle(10);
    publicBulletInfo.bullets.setAll('anchor.X', 0.5);
    publicBulletInfo.bullets.setAll('anchor.y', 0.5);
    //publicBulletInfo.bullets.body.bounce.setTo(1, 1);
    // Input
    /*cursors = game.input.keyboard.createCursorKeys();
    game.input.keyboard.addKeyCapture([Phaser.Keyboard.SPACEBAR]);*/

    Game.healthBar = Game.add.graphics(0,0);
    var hp = 100;
    var totHP = 100;
    var noneHP = 0;
    if(noneHP !== hp){
        Game.healthBar.clear();
        var xHealth = (hp / totHP) * 100;
        var color = 0xffaea;
        Game.healthBar.beginFill(color);
        Game.healthBar.lineStyle(15, color, 1);
        Game.healthBar.moveTo(10, 10);
        Game.healthBar.lineTo(1.5 * xHealth, 10);
        Game.healthBar.endFill();
    }

};

Game.update = function()
{


    //this.game.camera.addChild(Game.add.text(10, 10, 'Shield: ' + Game.playerMap[Client.id].health +'%', { font: '20px Arial', fill: '#fff' }));
   // var barWidth = healthBar.width;
    //healthBar.width = barWidth - barWidth/Game.playerMap[Client.getPlayerID()].health;

    // Maintain window scale thru resizing
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

    Game.physics.arcade.collide(playerArray, playerArray);
    Game.physics.arcade.collide(layer, playerArray);
    //Game.physics.arcade.collide(layer, publicBulletInfo.bullets);
    Game.physics.arcade.collide(playerArray, bulletInfo.bullets);
    Game.physics.arcade.collide(layer, bulletInfo.bullets);
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
            Client.sendRotation(300);.
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
    }

    // Get firing input
    if (game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR))
    {
        //Client.sendShoot();
        //fireBullet(bulletInfo);
        fireBullet(bulletInfo);
    }
    //shield.render();
    // Sync the transform of remote instances of this player
    Game.sendTransform();
    //Game.updateHUD();


};

function sendLoc(){

}
/*
function fire() {

    Client.sendFire(bulletInfo);
}*/

function fireBullet(bulletInfo) {
    //console.log("fire");

    if (game.time.now > bulletInfo.bulletTime) {
        bulletInfo.bullet = bulletInfo.bullets.getFirstExists(false);

        if (bulletInfo.bullet) {
            bulletInfo.bullet.reset(Game.playerMap[Client.player.id].x, Game.playerMap[Client.player.id].y);
            //bullet.body.collideWorldBounds = true;
            bulletInfo.bullet.lifespan = 2000;
            bulletInfo.bullet.rotation = Game.playerMap[Client.player.id].rotation;
            game.physics.arcade.velocityFromRotation(Game.playerMap[Client.player.id].rotation, 1000, bulletInfo.bullet.body.velocity);
            bulletInfo.bulletTime = game.time.now + 50;
            //Client.sendFire(bulletInfo.bullet);
            Client.sendFire(Game.playerMap[Client.player.id].x, Game.playerMap[Client.player.id].y, Game.playerMap[Client.player.id].rotation);
        }
    }
}


Game.updateBullets = function(x, y, rotation) {
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
            publicBulletInfo.bullet.reset(x, y);
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
        Game.updateHUD(player);
        Client.sendTransform(player.x, player.y, player.rotation);
    }
};

Game.updateHUD = function(player){
    shield.setText('Shield: ' + player.health +'%\n' +
        'Bullets: ' + playerHUD["bullets"] + '\n' +
        'Boost: ' + playerHUD["boost"] + '\n' +
        'Currency: ' + playerHUD["currency"], { font: '100px Arial', fill: '#fff' });
    shield.x = player.x - ((window.innerWidth / 2) * 1.35);
    shield.y = player.y - ((window.innerHeight / 2) * 1.3);
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

Game.addNewPlayer = function(id,x,y,rotation){
    console.log('Game.addNewPlayer '+id);

    // Create player sprite and assign the player a unique ship
    var shipSelectionString = assignShip(playerArray.length + 1);
    var newPlayer = game.add.sprite(x,y,shipSelectionString);
    newPlayer.width = 64;   // set pixel width
    newPlayer.height = 64;  // set pixel height

    console.log('shipSelectionString: ' + shipSelectionString);

    // Set player sprite origin to center

    // Set starting rotation of player instance
    newPlayer.rotation = rotation;

    // Enable appropriate player physics
    Game.physics.enable(newPlayer, Phaser.Physics.ARCADE);
    newPlayer.enableBody = true;                            //Here is what is needed for
    newPlayer.body.collideWorldBounds = true;
    // newPlayer.body.anchor(0.5,0.5);
    newPlayer.body.setSize(newPlayer.width /2, newPlayer.height /2, 0, 0);                   //collisions to work
    newPlayer.anchor.set(0.5);
    newPlayer.body.bounce.setTo(.5, .5);
    newPlayer.body.drag.set(100);
    newPlayer.body.maxVelocity.set(200);
    newPlayer.heal(100);


    shield = Game.add.text(0, 0, '', { font: '35px Arial', fill: '#fff' });

    //var healthBar = newPlayer.addChild(Game.add.text(0, 0, 'Shield: ' + newPlayer.health +'%', { font: '20px Arial', fill: '#fff' }));
    // Local player should be instantiated first before remote players

    //healthBar = game.add.sprite(Game.world.width - 150, 10,bmd);
    //healthBar.anchor.y = 0.5;

    Game.playerMap[id] = newPlayer;
    playerArray.push(newPlayer);
    if (!Game.localPlayerInstantiated) {
        Game.localPlayerInstantiated = true;
    }

    // Set local camera to follow local player sprite
    this.game.camera.follow(Game.playerMap[Client.getPlayerID()], Phaser.Camera.FOLLOW_LOCKON);
};


Game.setAllPlayersAdded = function(){
    Game.allPlayersAdded = true;
};

//This function creates a string name of the ship to be assigned to a new player
function assignShip(amountOfPlayers) {
    var shipNumber = amountOfPlayers % numberOfShipSprites;
    return 'ship' + shipNumber;
}

Game.rescale = function(){
    console.log('Rescaling game to '+window.innerWidth+'x'+window.innerHeight);
    this.game.scale.setGameSize(window.innerWidth, window.innerHeight);

    // // Make sure camera bounds are maintained
    this.game.camera.bounds = new Phaser.Rectangle(-this.game.world.width,-this.game.world.height,
        this.game.world.width*3, this.game.world.height*3);
};