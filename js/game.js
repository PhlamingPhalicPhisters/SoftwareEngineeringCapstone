/*var game = new Phaser.Game(16*32, 600, Phaser.AUTO, document.getElementById('game'));
game.state.add('Game',Game);
game.state.start('Game');*/

var Game = {};

var playerArray = [];

var layer;
var safeZoneLayer;

var weaponArray = [];
function addWeapon(lifespan, velocity, bulletTime, damage) {
    weaponArray.push({lifespan: lifespan, velocity: velocity, bulletTime: bulletTime, damage: damage});
}
addWeapon(2000, 1000, 50, 6);
addWeapon(2000, 1750, 65, 2);
addWeapon(2000, 500, 75, 10);

Game.ammoMap = {};
Game.bulletArray = [];

//This variable represents the amount of ships in the game
//It is used when assigning new players a ship
const numberOfShipSprites = 9;

Game.init = function(){
    Client.connect();
    console.log('Game.init');
    // Disable scroll bars
    //document.documentElement.style.overflow = 'hidden'; // firefox, chrome
    //document.body.scroll = "no";    // ie only
    // Run game in background
    this.game.stage.disableVisibilityChange = true;

    Game.playerSize = 64;   // sq. px. size
    Game.isSafe = false;    // local player is in safe zone
};


Game.preload = function() {
    console.log('Game.preload');

    game.load.onLoadStart.addOnce(loadStart, this);
    this.game.stage.disableVisibilityChange = true;

    // Load map assets
    this.game.load.tilemap('map', 'assets/map/bigtilestest.json', null, Phaser.Tilemap.TILED_JSON);
    this.game.load.image('tiles', 'assets/map/largetilesheet.png');

    // Load ship assets
    this.game.load.image('ship1','assets/sprites/ship1.png');
    this.game.load.image('ship2','assets/sprites/ship2.png');
    this.game.load.image('ship3','assets/sprites/ship3.png');
    this.game.load.image('ship4','assets/sprites/ship4.png');
    this.game.load.image('ship5','assets/sprites/ship5.png');
    this.game.load.image('ship6','assets/sprites/ship6.png');
    this.game.load.image('ship7','assets/sprites/ship7.png');
    this.game.load.image('ship8','assets/sprites/ship8.png');

    // Load weapon assets
    this.game.load.image('bullet', 'assets/sprites/general-bullet.png');
    this.game.load.image('bullet1', 'assets/sprites/bullet1.png');
    this.game.load.image('bullet2', 'assets/sprites/bullet2.png');

    // Load dust assets
    //this game.load.image('dust', TODODODODODO);

    this.game.load.image('ship0', 'assets/sprites/general-bullet.png');
};

//Helper function for the loading screen
function loadStart() {
    game.add.sprite(game.world.centerX,game.world.centerY, 'shipload');
    game.stage.backgroundColor = '#000000';
    game.add.text(game.world.centerX+40,game.world.centerY, 'Loading...', { fill: '#ffffff' });
    //var sprite = game.add.sprite(game.world.centerX,game.world.centerY,'loadingSprite');
    //sprite.animations.add('spin');
    //sprite.animations.play('spin',10,true);
};

var sprite;
var cursors;
var thisPlayer;
//var lastServerTime;
var playerHUD = {
    "health": 0,
    "bullets": 0,
    "boost": 0,
    "currency": 0
};



var bullet;
Game.create = function(){
    console.log('Game.create');

    //***
    //*** Uncomment for optimization but make sure the background
    //*** outside of the map is not visible otherwise trippy shit happens
    //***
    //game.renderer.clearBeforeRender = false;
    //game.renderer.roundPixels = true;

    game.time.advancedTiming = true;

    // Enable Phaser Arcade game physics engine
    //this.game.physics.startSystem(Phaser.Physics.ARCADE);
    Game.physics.startSystem(Phaser.Physics.ARCADE);

    // Create reference list of all players in game
    Game.playerMap = {};
    Game.allPlayersAdded = false;
    Game.localPlayerInstantiated = false;
    Game.bulletsCreated = false;

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

    // Set up tile mapping and layer system
    //Name of tilesheet in json, name in game.js
    var map = this.game.add.tilemap('map');
    map.addTilesetImage('largetilesheet','tiles');

    //Order of these statments impacts the order of render
    map.createLayer('Backgroundlayer');
    layer = map.createLayer('Groundlayer');
    safeZoneLayer = map.createLayer('SafeZoneLayer');
    map.setCollisionBetween(0, 4000, true, 'Groundlayer');
    layer.resizeWorld();

    // Enable Phaser Arcade game physics engine
    this.game.physics.startSystem(Phaser.Physics.ARCADE);

    // Create Local player & all active remote players
    Client.askNewPlayer();
    Client.getPlayer();

    this.game.camera.bounds = new Phaser.Rectangle(-this.game.world.width,-this.game.world.height,
        this.game.world.width*3, this.game.world.height*3);

    Game.cursors = this.game.input.keyboard.addKeys( { 'up': Phaser.KeyCode.W, 'down': Phaser.KeyCode.S,
        'left': Phaser.KeyCode.A, 'right': Phaser.KeyCode.D } );
    this.game.input.keyboard.addKeyCapture([Phaser.Keyboard.SPACEBAR]);

    bullet = game.add.sprite(200,200,'bullet');
    bullet.scale.setTo(0.5,0.5);
    bullet.enableBody = true;
    Game.physics.enable(bullet, Phaser.Physics.ARCADE);
    //bullet.body.setSize(bullet.width,bullet.height,0.5,0.5);
    // publicBulletInfo.bullets.bodies.setCircle(10);
    // Input
    /*cursors = game.input.keyboard.createCursorKeys();
    game.input.keyboard.addKeyCapture([Phaser.Keyboard.SPACEBAR]);*/
    console.log("Got to creation");

};

/*
window.addEventListener("focus", function(event)
{
    game.input.keyboard.start();
    console.log('in focus');
}, false);*/

Game.focused = true;
window.addEventListener("blur", function(event) {
    game.input.keyboard.reset();
    Client.setFocus(false);
    Game.focused = false;
}, false);
window.addEventListener("focus", function(event) {
    Client.askUpdate();
    Client.setFocus(true);
    Game.focused = true;
}, false);

Game.update = function()
{

        // Establish collision detection between groups
        Game.physics.arcade.collide(playerArray, playerArray);
        Game.physics.arcade.collide(layer, playerArray);
        // Game.physics.arcade.collide(dustGroup, playerArray, Game.collectEvent);
        Game.physics.arcade.overlap(safeZoneLayer, playerArray, Game.safeZoneEvent);

    for(var q in Game.bulletArray)
        for(var p in playerArray)
            Game.physics.arcade.collideHandler(playerArray[p], Game.bulletArray[q], function(player, bullet){player.damage(bullet.damage); bullet.destroy();});

    for(var r in Game.bulletArray)
        Game.physics.arcade.collideHandler(Game.bulletArray[r], layer, function(theBullet, theLayer){
            // console.log('before bullet.destroy()');
            // theBullet.body = null;
            // theBullet.destroy();
            // console.log('after bullet.destroy()');
        });

    /*for (var i in Game.ammoMap) {
        for(var p in playerArray) {
            Game.physics.arcade.collide(playerArray[p], Game.ammoMap[i], Game.bulletDamage);
        }
        Game.physics.arcade.collide(layer, Game.ammoMap[i], Game.bulletDestroy);
    }*/

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
    }

    // Get firing input
    if (game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR))
    {
        //Client.sendShoot();
        //fireBullet(bulletInfo);
        fireBullet();
    }

    if (game.input.keyboard.isDown(Phaser.Keyboard.SHIFT)
        && game.input.keyboard.isDown(Phaser.Keyboard.ESC))
    {

    }

    // Sync the transform of remote instances of this player
    Game.sendTransform();
};


Game.safeZoneEvent = function(safeZoneLayer, player){
    Client.sendCollect(5);
};


Game.bulletDamage = function(player, ammo){
    //var bullet = ammo.getFirstExists(false);
    player.damage(ammo.damage);
    ammo.destroy();
};

Game.bulletDestroy = function(heck, blasty){

    blasty.destroy(this);

    //ammo.destroy();
};

/*Game.render = function(){
    if (Game.allPlayersAdded) {
        game.debug.body(Game.playerMap[Client.getPlayerID()]);
    }
    game.debug.body(bullet);
    game.debug.text(game.time.fps, 2, 14, "#00ff00");
};*/

Game.updateName = function(id, name)    //This never gets called?
{
    Game.playerMap[id].name = name;
    //console.log("It the name boi: " + Game.playerMap[id].name);
};

function fireBullet() {
    if (game.time.now > Game.ammoMap[Client.id].bulletTime && Client.weaponId !== -1) {
        var bullet = Game.ammoMap[Client.id].getFirstExists(false);

        if (bullet && Client.ammo > 0) {
            Client.ammo--;
            bullet.reset(Game.playerMap[Client.getPlayerID()].body.x + Game.playerMap[Client.player.id].width/2, Game.playerMap[Client.player.id].body.y + Game.playerMap[Client.player.id].height/2);
            bullet.lifespan = weaponArray[Client.weaponId].lifespan;
            bullet.rotation = Game.playerMap[Client.player.id].rotation;
            bullet.damage = weaponArray[Client.weaponId].damage;
            game.physics.arcade.velocityFromRotation(Game.playerMap[Client.player.id].rotation, weaponArray[Client.weaponId].velocity, bullet.body.velocity);
            Game.ammoMap[Client.id].bulletTime = game.time.now + weaponArray[Client.weaponId].bulletTime;
            bullet.events.onKilled.add(function() {
                bullet.destroy();
            }, this);
            Client.changeAmmo(Client.ammo);
            Client.sendFire(Game.playerMap[Client.player.id].body.x + Game.playerMap[Client.player.id].width/2, Game.playerMap[Client.player.id].body.y + Game.playerMap[Client.player.id].height/2, Game.playerMap[Client.player.id].rotation, Client.weaponId, Client.id);
        }
    }
}


Game.updateBullets = function(x, y, rotation, weaponId, id) {
    if (!document.hidden && typeof Game.ammoMap[id] !== 'undefined') {
        var bullet = Game.ammoMap[id].getFirstExists(false);

        if (bullet) {
            bullet.reset(x, y);
            bullet.lifespan = weaponArray[weaponId].lifespan;
            bullet.damage = weaponArray[weaponId].damage;
            bullet.rotation = rotation;
            game.physics.arcade.velocityFromRotation(rotation, weaponArray[weaponId].velocity, bullet.body.velocity);
            bullet.events.onKilled.add(function() {
                bullet.destroy();
            }, this);
        }
    }
};



Game.updateAmmo = function(id, ammo, weaponId) {
    Game.ammoMap[id] = game.add.group();
    Game.ammoMap[id].enableBody = true;
    Game.ammoMap[id].physicsBodyType = Phaser.Physics.ARCADE;
    if (weaponId === 0)
        Game.ammoMap[id].createMultiple(ammo, 'bullet');
    if (weaponId === 1)
        Game.ammoMap[id].createMultiple(ammo, 'bullet1');
    if (weaponId === 2)
        Game.ammoMap[id].createMultiple(ammo, 'bullet2');
    Game.ammoMap[id].setAll('scale.x', 0.5);
    Game.ammoMap[id].setAll('scale.y', 0.5);
    Game.ammoMap[id].setAll('anchor.x', 0.5);
    Game.ammoMap[id].setAll('anchor.y', 0.5);
    Game.ammoMap[id].forEach(function(bullet) {
        bullet.body.setSize(bullet.width * Game.ammoMap[id].scale.x,
            bullet.height * Game.ammoMap[id].scale.y);
        Game.bulletArray.push(bullet);
        //console.log(Game.bulletArray.length);
    });    // rescale bodies
    Game.ammoMap[id].bulletTime = 0;
    if (Game.ammoMap.length === Game.playerMap)
        Game.bulletsCreated = true;
};

// Sync position and rotation of remote instances of player
Game.sendTransform = function() {
    //console.log('Game sendTransform');
    if(Client.getPlayerID() !== -1 && Game.localPlayerInstantiated && Game.focused/*&& Game.playerMap.length > 0*/) {
        var player = Game.playerMap[Client.getPlayerID()];
        Game.updateHUD(player);
        Client.sendTransform(player.x, player.y, player.rotation, player.health);
    }
};


Game.updateHUD = function(player){
    //player.shield.x = player.x - ((window.innerWidth / 2) - 20);
    //player.shield.y = player.y - ((window.innerHeight / 2) - 20);

    player.shield.x = (this.game.camera.width / 2) - ((window.innerWidth / 2) - 20);
    player.shield.y = (this.game.camera.height / 2) - ((window.innerHeight / 2) - 20);
    player.shield.fixedToCamera = true;
    player.nameHover.setText(Client.name);
    player.nameHover.x = (this.game.camera.width / 2) - (player.nameHover.width / 2);
    player.nameHover.y = (this.game.camera.height / 2) - 60;
    player.nameHover.fixedToCamera = true;


    if(player.prevHealth != player.health || player.prevAmmo != Client.ammo) {
        playerHUD["bullets"] = Client.ammo;
        player.prevAmmo = Client.ammo;
        player.shield.setText('Shield:\n' +
            'Bullets: ' + playerHUD["bullets"] + '\n' +
            'Boost: ' + playerHUD["boost"] + '\n' +
            'Currency: ' + playerHUD["currency"], {font: '100px Arial', fill: '#fff'});
    }


    Game.updateHealthBar(player);
};

Game.updateHealthBar = function(player) {
    //player.damage(.05);

    if (player.prevHealth != player.health){
        player.healthBar.clear();
        var x = player.health / 100;
        var xHealth = (player.health / 100) * 100;
        var color = Game.rgbToHex((2.0 * x) * 255, (2.0 * (1 - x)) * 255, 0);
        //Game.healthBar.x = 10;
        //Game.healthBar.y = 10;
        player.healthBar.beginFill(color);
        player.healthBar.lineStyle(30, color, 1);
        player.healthBar.moveTo(0, 0);
        player.healthBar.lineTo((1.5 * xHealth), 0);
        player.healthBar.endFill();
    }
    player.healthBar.x = player.shield.x + 120;
    player.healthBar.y = player.shield.y + 20;
    player.prevHealth = player.health;
    player.healthBar.fixedToCamera = true;
};

// Update the position and rotation of a given remote player
Game.updateTransform = function(id, x, y, rotation, health) {
    if (Game.allPlayersAdded) {
        var player = Game.playerMap[id];
        player.x = x;
        player.y = y;
        player.rotation = rotation;
        player.health = health;
        Game.playerMap[id] = player;
        // console.log('player name='+Game.playerMap[id].name);
        if (id === Client.id && player.health <= 0) {
            Game.playerMap[id].kill();
        }
    }

};

// Update the ship of another player
Game.updatePlayerShip = function(id, shipName){
    if (Game.allPlayersAdded){
        console.log('we got to update playership, the player id is: '+ id + " " + shipName);
        Game.playerMap[id].loadTexture(shipName); // loadTexture draws the new sprite
    }
};

Game.removePlayer = function(id){
    console.log('Game.removePlayer '+id+'--'+Game.playerMap[id].name);
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
    if (direction === 1)
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

Game.updateCollect = function(id, value)
{
    playerHUD["currency"] += value;
};

Game.addNewPlayer = function(id,x,y,rotation,shipName,name){
    console.log('Game.addNewPlayer '+id+'--'+name+'--'+shipName);

    var newPlayer;


    // Create player sprite and assign the player a unique ship
    // If it is a new player
    if(shipName == 'unassignedShip' && id == Client.getPlayerID()){
        var shipSelectionString = assignShip(id + 1);
        newPlayer = game.add.sprite(x,y,shipSelectionString);
        console.log('if statement - shipSelectionString: ' + shipSelectionString);
        Client.sendShipChange(shipSelectionString);
    }
    // If it is an existing player
    else{
        newPlayer = game.add.sprite(x,y,shipName);
        console.log('else statement - shipSelectionString: ' + shipName);
    }

    // make all ships the same width & height
    newPlayer.width = Game.playerSize;
    newPlayer.height = Game.playerSize;

    // Set player sprite origin to center
    newPlayer.anchor.set(0.5);
    // Set starting rotation of player instance
    newPlayer.rotation = rotation;

    newPlayer.name = name;

    // Enable appropriate player physics
    Game.physics.enable(newPlayer, Phaser.Physics.ARCADE);
    newPlayer.enableBody = true;                            //Here is what is needed for
    newPlayer.body.collideWorldBounds = true;
    // newPlayer.body.anchor(0.5,0.5);
    //newPlayer.body.setSize(newPlayer.width, newPlayer.height, 0.5, 0.5);                   //collisions to work
    newPlayer.body.bounce.setTo(.5, .5);
    newPlayer.body.drag.set(100);
    newPlayer.body.maxVelocity.set(200);

    newPlayer.heal(100);

   /* newPlayer.shield.setText('Shield:\n' +
        'Bullets: ' + playerHUD["bullets"] + '\n' +
        'Boost: ' + playerHUD["boost"] + '\n' +
        'Currency: ' + playerHUD["currency"], { font: '100px Arial', fill: '#fff' }); */
    // Local player should be instantiated first before remote players

    // Local player should be instantiated first before remote players
    Game.playerMap[id] = newPlayer;
    Game.playerMap[id].shield = Game.add.text(0, 0, '', { font: '35px Arial', fill: '#fff' });
    Game.playerMap[id].nameHover = Game.add.text(0, 0, '', {font: '20px Arial', fill: '#fff'});
    Game.playerMap[id].healthBar = Game.add.graphics(0,0);
    Game.playerMap[id].prevHealth = -1;
    //Game.createHealthBar(Game.playerMap[id]);
    playerArray.push(newPlayer);
    if (!Game.localPlayerInstantiated) {
        Game.localPlayerInstantiated = true;
    }

    // Set local camera to follow local player sprite
    this.game.camera.follow(Game.playerMap[Client.getPlayerID()], Phaser.Camera.FOLLOW_LOCKON);
    this.game.renderer.renderSession.roundPixels = true;


};

Game.setDeathBehavior = function(id) {
    Game.playerMap[id].events.onKilled.add(function() {
        Client.disconnect();
        game.state.start('Menu');
    });
};

Game.createHealthBar = function(player){
    player.healthBar = Game.add.graphics(0,0);
    player.healthBar.clear();
    var xHealth = (player.health / 100) * 100;
    player.prevHealth = xHealth;
    var color = Game.rgbToHex(255, 0, 0);
    //Game.healthBar.x = 10;
    //Game.healthBar.y = 10;
    player.healthBar.beginFill(color);
    player.healthBar.lineStyle(30, color, 1);
    //player.healthBar.moveTo(0, 0);
    player.healthBar.lineTo(1.5 * xHealth, 0);
    player.healthBar.endFill();
    //Game.healthBar[player.id].x = player.x;
    //Game.healthBar[player.id].y = player.y;
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

Game.rgbToHex = function(r, g, b) {
    return parseInt("0x" + Game.componentToHex(r) + Game.componentToHex(g) + Game.componentToHex(b));
};

Game.componentToHex = function(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
};