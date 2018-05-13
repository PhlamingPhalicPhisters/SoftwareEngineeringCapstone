var Game = {};

var layer;

var weaponArray = [];
function addWeapon(lifespan, velocity, bulletTime, damage) {
    weaponArray.push({lifespan: lifespan, velocity: velocity, bulletTime: bulletTime, damage: damage});
}
addWeapon(2000, 900, 100, 6);
addWeapon(2000, 900, 50, 2);
addWeapon(2000, 900, 150, 10);

Game.ammoMap = {};
var firedBullets = new Map();
var playerMap = new Map();
var bulletID = 0;


//This variable represents the amount of ships in the game
//It is used when assigning new players a ship
const numberOfShipSprites = 15;

Game.init = function(){
    Client.connect();
    console.log('Game.init');
    // Disable scroll bars
    //document.documentElement.style.overflow = 'hidden'; // firefox, chrome
    //document.body.scroll = "no";    // ie only
    // Run game in background
    this.game.stage.disableVisibilityChange = true;

    Game.leaderboard = [null, null, null, null, null, null];

    Game.playerSize = 64;           // sq. px. size
    Game.isSafe = false;            // local player is in safe zone
    Game.maxNormVelocity = 200;         // maximum body acceleration
    Game.maxBoost = 100;            // max boost capacity
    Game.maxBoostVelocity = 400;    // maximum body acceleration when boosting
    Game.normalAccel = 100;         // normal player acceleration speed
    Game.boostAccelMult = 10;        // boost acceleration multiplier
    Game.normalAngVel = 300;        // normal player rotation speed
    Game.boostRotMult = 0.5;        // boost rotation mutliplier
    Game.boostCost = .01;           // how much boost costs when active
    Game.refillBoostCost = 100;     // how much it costs to refill boost in the safe zone

    Game.bulletReloadCostList = [100, 250, 500];
    Game.boostRefillCost = 200;
};


Game.preload = function() {
    console.log('Game.preload');

    game.load.onLoadStart.addOnce(loadStart, this);
    this.game.stage.disableVisibilityChange = true;

    // Load map assets
    this.game.load.tilemap('map', 'assets/map/neontest.json', null, Phaser.Tilemap.TILED_JSON);
    this.game.load.image('tiles', 'assets/map/largetilesheet.png');
    this.game.load.image('safe_zone', 'assets/map/grid.png');
    this.game.load.image('neon', 'assets/map/tilemapneonsmall.png');

    // Load ship assets
    this.game.load.image('ship1','assets/sprites/neon/Ship1.png');
    this.game.load.image('ship2','assets/sprites/neon/Ship2.png');
    this.game.load.image('ship3','assets/sprites/neon/Ship3.png');
    this.game.load.image('ship4','assets/sprites/neon/Ship4.png');
    this.game.load.image('ship5','assets/sprites/neon/Ship5.png');
    this.game.load.image('ship6','assets/sprites/neon/Ship6.png');
    this.game.load.image('ship7','assets/sprites/neon/Ship7.png');
    this.game.load.image('ship8','assets/sprites/neon/Ship8.png');
    this.game.load.image('ship9','assets/sprites/neon/Ship9.png');
    this.game.load.image('ship10','assets/sprites/neon/Ship10.png');
    this.game.load.image('ship11','assets/sprites/neon/Ship11.png');
    this.game.load.image('ship12','assets/sprites/neon/Ship12.png');
    this.game.load.image('ship13','assets/sprites/neon/Ship13.png');
    this.game.load.image('ship14','assets/sprites/neon/Ship14.png');
    this.game.load.image('ship15','assets/sprites/neon/Ship15.png');

    // Load dust asset
    //thsis.game.load.spritesheet('dust', 'assets/sprites/neon/Dust.png',500,500,30);
    this.game.load.image('dust', 'assets/sprites/neon/Dust Single.png');

    // Load Particles
    // this.game.load.image('trail', 'assets/sprites/w_trail.png');
    this.game.load.image('trail', 'assets/sprites/w_bubble.png');
    this.game.load.image('spark', 'assets/sprites/neon/spark.png');
    this.game.load.image('sparksmall', 'assets/sprites/neon/bluespark.png');

    // Load weapon assets
    this.game.load.image('bullet', 'assets/sprites/neon/GreenShot.png');
    this.game.load.image('bullet1', 'assets/sprites/neon/RedShot.png');
    this.game.load.image('bullet2', 'assets/sprites/neon/BlueShot.png');

    this.game.load.image('ship0', 'assets/sprites/neon/squaresquare.png');
};

//Helper function for the loading screen
function loadStart() {
    var shiploadsprite = game.add.sprite(game.world.centerX - 50,game.world.centerY - 25, 'shipload');
    shiploadsprite.height = 75;
    shiploadsprite.width = 75;
    game.stage.backgroundColor = '#000000';
    game.add.text(game.world.centerX+40,game.world.centerY, 'Loading...', { fill: '#ffffff' });
    //var sprite = game.add.sprite(game.world.centerX,game.world.centerY,'loadingSprite');
    //sprite.animations.add('spin');
    //sprite.animations.play('spin',10,true);
};

var sprite;


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
    Game.shipTrails = game.add.group();
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
    map.addTilesetImage('tilemapneonsmall', 'neon');

    //Order of these statments impacts the order of render
    map.createLayer('Backgroundlayer');
    // safeZoneLayer = map.createLayer('Zonelayer');
    Game.safeZone = game.add.sprite(3235,3240,'safe_zone');
    Game.safeZone.width = 1205;
    Game.safeZone.height = 1205;
    Game.safeZone.anchor.setTo(0.5,0.5);
    Game.safeZone.alpha = 0.6;
    layer = map.createLayer('Groundlayer');
    map.setCollisionBetween(0, 4000, true, 'Groundlayer');
    // map.setCollisionBetween(0, 1, true, 'Zonelayer');
    layer.resizeWorld();

    // Enable Phaser Arcade game physics engine
    this.game.physics.startSystem(Phaser.Physics.ARCADE);
    Game.safeZone.enableBody = true;
    Game.physics.enable(Game.safeZone, Phaser.Physics.ARCADE);

    // Create Local player & all active remote players
    Client.askNewPlayer();
    Client.getPlayer();

    this.game.camera.bounds = new Phaser.Rectangle(-this.game.world.width,-this.game.world.height,
        this.game.world.width*3, this.game.world.height*3);

    Game.playerHUD = {
        "health": 0,
        "bullets": 0,
        "boost": 0,
        "currency": 0
    };

    Game.cursors = this.game.input.keyboard.addKeys( { 'up': Phaser.KeyCode.W, 'down': Phaser.KeyCode.S,
        'left': Phaser.KeyCode.A, 'right': Phaser.KeyCode.D } );
    this.game.input.keyboard.addKeyCapture([Phaser.Keyboard.SPACEBAR]);

    //bullet.body.setSize(bullet.width,bullet.height,0.5,0.5);
    // publicBulletInfo.bullets.bodies.setCircle(10);
    // Input
    /*cursors = game.input.keyboard.createCursorKeys();
    game.input.keyboard.addKeyCapture([Phaser.Keyboard.SPACEBAR]);*/
    console.log("Got to creation");
    Game.playerDestroyed = false;

    //generate dust for the player
    generateDustForClient();
    console.log("Testing the dust list to verify that it loaded correctly, " +
        "dust x position: " + dustList[100].positionx);
    Game.playerDestroyed = false;
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

    deathDustMap.forEach(function (dust) {
        Game.physics.arcade.collide(dust, Game.playerMap[Client.getPlayerID()], dustCollisionDeath);
    });

    playerMap.forEach(function (player) {
        Game.physics.arcade.overlap(dustList, player, dustCollision);
    });

    Game.physics.arcade.collide(layer, Game.playerMap[Client.getPlayerID()]);

    //Game.physics.arcade.overlap(bullet, playerArray, Game.safeZoneEvent);       // TODODODODODO - SWAP WITH SAFEZONE, (playerArray no longer exists)
    if (Game.physics.arcade.overlap(Game.safeZone, Game.playerMap[Client.getPlayerID()], Game.enterSafeZone)){}
    else {
        Game.exitSafeZone();
    }

    //Bullet collision
    var bulletErase = [];
    if(firedBullets.size > 0 && !document.hidden && typeof Game.ammoMap[Client.getPlayerID()] !== 'undefined' && Client.getPlayerID() !== -1) {
        firedBullets.forEach(function (bullet) {
            playerMap.forEach(function (player, key) {
                if(key !== bullet.player) {
                    Game.physics.arcade.overlap(player, bullet, function (player, bullet) {
                        burstLittle(bullet.x, bullet.y);
                        bulletErase.push(bullet);
                        player.damage(bullet.damage);
                    });
                }
            });
            Game.physics.arcade.overlap(bullet, Game.safeZone, function (bullet) {
                burstLittle(bullet.x, bullet.y);
                bulletErase.push(bullet);
            });
            Game.physics.arcade.overlap(layer, bullet, function (bullet, layer) {
                if(layer.index !== -1) {
                    burstLittle(bullet.x, bullet.y);
                    bulletErase.push(bullet);
                }
            });
        });

        Game.physics.arcade.overlap(dustList, playerMap, dustCollision);

        for(var e in bulletErase){
            firedBullets.delete(bulletErase[e].id);
            bulletErase[e].destroy();
        }
    }


    // Get forward/backward input
    if (Game.cursors.up.isDown)
    {
        // Client.sendAcceleration(1);
        Game.setPlayerAcceleration(Game.normalAccel, game.input.keyboard.isDown(Phaser.Keyboard.SHIFT))
    }
    else if (Game.cursors.down.isDown)
    {
        // Client.sendAcceleration(-1);
        Game.setPlayerAcceleration(-Game.normalAccel, game.input.keyboard.isDown(Phaser.Keyboard.SHIFT))
    }
    else
    {
        // Client.sendAcceleration(0);
        Game.setPlayerAcceleration(0, false);
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

    if (game.input.keyboard.isDown(Phaser.KeyCode.Q) || game.input.keyboard.isDown(Phaser.KeyCode.L)) {
        showPlayerNames();
    }
    else {
        removePlayerNames();
    }

    // Get firing input
    if (!Game.isSafe && game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR))
    {
        //Client.sendShoot();
        //fireBullet(bulletInfo);
        fireBullet(Client.getPlayerID());
    }

    if (game.input.keyboard.isDown(Phaser.Keyboard.SHIFT)
        && game.input.keyboard.isDown(Phaser.Keyboard.ESC))
    {

    }

    if (Game.allPlayersAdded) {
        if (Game.isSafe) {
            Game.showBasePrompts();

            if (game.input.keyboard.isDown(Phaser.KeyCode.E)) {
                //Game.requestShipUpgrade();
            }
            if (game.input.keyboard.isDown(Phaser.KeyCode.R)) {
                Game.reloadWeapon();
            }
            if (game.input.keyboard.isDown(Phaser.KeyCode.B)) {
                Game.refillBoost();
            }
        }
        else {
            Game.unshowBasePrompts();
        }
    }

    // Sync the transform of remote instances of this player
    // Send transform also handles the amount of health and the hud display
    // Inside of the health tracker when a player dies dust is dropped
    Game.sendTransform();
};


/*Game.render = function(){
    if (Game.allPlayersAdded) {
        game.debug.body(Game.playerMap[Client.getPlayerID()]);
    }
    game.debug.body(bullet);
    game.debug.text(game.time.fps, 2, 14, "#00ff00");
};*/


Game.enterSafeZone = function(safeZone, player){
    Game.isSafe = true;
    // Client.sendCollect(5);
};

Game.exitSafeZone = function() {
    Game.isSafe = false;
};

Game.updateScore = function(id, value) {
    if (Game.playerMap[id].score !== null) {
        Game.playerMap[id].score = value;
    }
    // Game.playerHUD["currency"] = value;
};

// Game.render = function(){
//     if (Game.allPlayersAdded) {
//         game.debug.body(Game.playerMap[Client.getPlayerID()]);
//     }
//     game.debug.body(bullet);
//     game.debug.text(game.time.fps, 2, 14, "#00ff00");
// };


Game.updateName = function(id, name){  //This never gets called?
    Game.playerMap[id].name = name;
    //console.log("It the name boi: " + Game.playerMap[id].name);
};

function fireBullet(id) {
    if (game.time.now > Game.ammoMap[Client.id].bulletTime && Client.weaponId !== -1) {
        var bullet = Game.ammoMap[Client.id].getFirstExists(false);

        if (bullet && Client.ammo > 0) {
            Client.ammo--;
            bullet.reset(Game.playerMap[Client.getPlayerID()].body.x + Game.playerMap[Client.player.id].width/2 + (Game.playerMap[Client.player.id].width/2 * Math.cos(Game.playerMap[Client.player.id].rotation)), Game.playerMap[Client.player.id].body.y + Game.playerMap[Client.player.id].height/2 + (Game.playerMap[Client.player.id].height/2 * Math.sin(Game.playerMap[Client.player.id].rotation)));
            bullet.lifespan = weaponArray[Client.weaponId].lifespan;
            bullet.rotation = Game.playerMap[Client.player.id].rotation;
            bullet.damage = weaponArray[Client.weaponId].damage;
            game.physics.arcade.velocityFromRotation(Game.playerMap[Client.player.id].rotation, weaponArray[Client.weaponId].velocity, bullet.body.velocity);
            Game.ammoMap[Client.id].bulletTime = game.time.now + weaponArray[Client.weaponId].bulletTime;
            bullet.id = bulletID;
            bullet.player = id;
            firedBullets.set(bullet.id, bullet);
            bulletID++;
            bullet.events.onKilled.add(function() {
                burstLittle(bullet.x, bullet.y);
                firedBullets.delete(bullet.id);
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
            bullet.reset(x + (Game.playerMap[id].width/2 * Math.cos(Game.playerMap[id].rotation)), y + (Game.playerMap[id].height/2 * Math.sin(Game.playerMap[id].rotation)));
            bullet.lifespan = weaponArray[weaponId].lifespan;
            bullet.damage = weaponArray[weaponId].damage;
            bullet.rotation = rotation;
            bullet.id = bulletID;
            bullet.player = id;
            firedBullets.set(bullet.id, bullet);
            bulletID++;
            game.physics.arcade.velocityFromRotation(rotation, weaponArray[weaponId].velocity, bullet.body.velocity);
            bullet.events.onKilled.add(function() {
                burstLittle(bullet.x, bullet.y);
                firedBullets.delete(bullet.id);
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
    Game.ammoMap[id].setAll('scale.x', 1.5);
    Game.ammoMap[id].setAll('scale.y', 1.5);
    Game.ammoMap[id].setAll('anchor.x', 0.5);
    Game.ammoMap[id].setAll('anchor.y', 0.5);
    //Game.ammoMap[id].setAll('bounce', 0, 0);
    Game.ammoMap[id].forEach(function(bullet) {
        bullet.body.setSize(bullet.width * Game.ammoMap[id].scale.x,
            bullet.height * Game.ammoMap[id].scale.y);
    });    // rescale bodies
    Game.ammoMap[id].bulletTime = 0;

    if (Game.ammoMap.length === Game.playerMap)
        Game.bulletsCreated = true;
    Game.bulletsCreated = true;

    //if (Game.ammoMap.length === Game.playerMap)
    //    Game.bulletsCreated = true;

};

// Sync position and rotation of remote instances of player
Game.sendTransform = function() {
    //console.log('Game sendTransform');
    if(Client.getPlayerID() !== -1 && Game.localPlayerInstantiated && Game.focused/*&& Game.playerMap.length > 0*/) {
        Game.playerMap[Client.getPlayerID()].shipTrail.x = Game.playerMap[Client.getPlayerID()].x - (Game.playerMap[Client.getPlayerID()].width/2 * Math.cos(Game.playerMap[Client.getPlayerID()].rotation));
        Game.playerMap[Client.getPlayerID()].shipTrail.y = Game.playerMap[Client.getPlayerID()].y - (Game.playerMap[Client.getPlayerID()].height/2 * Math.sin(Game.playerMap[Client.getPlayerID()].rotation));
        // Game.playerMap[Client.getPlayerID()].shipTrail.rotation = Game.playerMap[Client.getPlayerID()].rotation;

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

    player.nameHover.setText(player.name);
    player.nameHover.x = (this.game.camera.width / 2) - (player.nameHover.width / 2);
    player.nameHover.y = (this.game.camera.height / 2) - 60;
    player.nameHover.fixedToCamera = true;

    player.scoreHover.setText('Score: ' + player.score);
    player.scoreHover.x = (this.game.camera.width / 2) - (player.scoreHover.width / 2);
    player.scoreHover.y = (this.game.camera.height / 2) - 90;
    player.scoreHover.fixedToCamera = true;

    // if(player.prevHealth != player.health || player.prevAmmo != Client.ammo) {
    Game.playerHUD["boost"] = player.boost;
    Game.playerHUD["bullets"] = Client.ammo;
    player.prevAmmo = Client.ammo;
    Game.playerHUD["currency"] = player.score;
    player.shield.setText('Shield:\n' +
        'Bullets: ' + Game.playerHUD["bullets"] + '\n' +
        'Boost: ' + Game.playerHUD["boost"] + '\n' +
        'Currency: ' + Game.playerHUD["currency"], {font: '100px Lucida Console', fill: '#fff'});
    // }


    Game.updateHealthBar(player);
    if (Game.allPlayersAdded)
    {
        Game.updateLeaderboard();
    }
};

Game.updateHealthBar = function(player) {
    //player.damage(.05);
    if(player.health === 0){
        Game.playerKilled(player);
        player.healthBar.clear();
    }
    else if (Game.isSafe){
        player.healthBar.safe = true;
        player.healthBar.clear();
        var x = player.health / 100;
        var xHealth = (player.health / 100) * 100;
        var color = Game.rgbToHex(0, 255, 0);
        //Game.healthBar.x = 10;
        //Game.healthBar.y = 10;
        player.healthBar.beginFill(color);
        player.healthBar.lineStyle(30, color, 1);
        player.healthBar.moveTo(0, 0);
        player.healthBar.lineTo((1.5 * xHealth), 0);
        player.healthBar.endFill();
    }
    else if (player.prevHealth != player.health || player.healthBar.safe){
        player.healthBar.safe = false;
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

    player.healthBar.x = player.shield.x + 150;
    player.healthBar.y = player.shield.y + 18;
    player.prevHealth = player.health;
    player.healthBar.fixedToCamera = true;
};


Game.updateLeaderboard = function() {
    Game.checkLeaderboard();
    Game.setLeaderboard();
};

Game.checkLeaderboard = function() {
    for (var p in Game.playerMap) {
        if (Game.leaderboard[1] === null ||
            (Game.playerMap[p].score > Game.leaderboard[1].score
                && Game.leaderboard[1] !== Game.playerMap[p]))
        {
            console.log('#1 = '+Game.playerMap[p].name);
            Game.removeFromLeaderboard(p);
            Game.leaderboard[5] = Game.leaderboard[4];
            Game.leaderboard[4] = Game.leaderboard[3];
            Game.leaderboard[3] = Game.leaderboard[2];
            Game.leaderboard[2] = Game.leaderboard[1];
            Game.leaderboard[1] = Game.playerMap[p];
        }
        else if (Game.leaderboard[2] === null ||
            (Game.playerMap[p].score > Game.leaderboard[2].score
                && Game.leaderboard[2] !== Game.playerMap[p]))
        {
            if (Game.leaderboard[1] !== Game.playerMap[p])
            {
                console.log('#2 = ' + Game.playerMap[p].name);
                Game.removeFromLeaderboard(p);
                Game.leaderboard[5] = Game.leaderboard[4];
                Game.leaderboard[4] = Game.leaderboard[3];
                Game.leaderboard[3] = Game.leaderboard[2];
                Game.leaderboard[2] = Game.playerMap[p];
            }
        }
        else if (Game.leaderboard[3] === null ||
            (Game.playerMap[p].score > Game.leaderboard[3].score
                && Game.leaderboard[3] !== Game.playerMap[p]))
        {
            if (Game.leaderboard[1] !== Game.playerMap[p]
                && Game.leaderboard[2] !== Game.playerMap[p])
            {
                console.log('#3 = ' + Game.playerMap[p].name);
                Game.removeFromLeaderboard(p);
                Game.leaderboard[5] = Game.leaderboard[4];
                Game.leaderboard[4] = Game.leaderboard[3];
                Game.leaderboard[3] = Game.playerMap[p];
            }
        }
        else if (Game.leaderboard[4] === null ||
            (Game.playerMap[p].score > Game.leaderboard[4].score
                && Game.leaderboard[4] !== Game.playerMap[p]))
        {
            if (Game.leaderboard[1] !== Game.playerMap[p]
                && Game.leaderboard[2] !== Game.playerMap[p]
                && Game.leaderboard[3] !== Game.playerMap[p])
            {
                console.log('#4 = ' + Game.playerMap[p].name);
                Game.removeFromLeaderboard(p);
                Game.leaderboard[5] = Game.leaderboard[4];
                Game.leaderboard[4] = Game.playerMap[p];
            }
        }
        else if (Game.leaderboard[5] === null ||
            (Game.playerMap[p].score > Game.leaderboard[5].score
                && Game.leaderboard[5] !== Game.playerMap[p]))
        {
            if (Game.leaderboard[1] !== Game.playerMap[p]
                && Game.leaderboard[2] !== Game.playerMap[p]
                && Game.leaderboard[3] !== Game.playerMap[p]
                && Game.leaderboard[4] !== Game.playerMap[p])
            {
                console.log('#5 = ' + Game.playerMap[p].name);
                Game.removeFromLeaderboard(p);
                Game.leaderboard[5] = Game.playerMap[p];
            }
        }
    }
};

Game.removeFromLeaderboard = function(id) {
    for(var i in Game.leaderboard)
    {
        if (Game.leaderboard[i] === Game.playerMap[id])
        {
            Game.leaderboard[i] = null;
        }
    }
};

Game.setLeaderboard = function() {
    Game.playerMap[Client.id].scoreboard.x = (this.game.camera.width / 2) + ((window.innerWidth / 2) - 20);
    Game.playerMap[Client.id].scoreboard.y = (this.game.camera.height / 2) - ((window.innerHeight / 2) - 20);
    Game.playerMap[Client.id].scoreboard.fixedToCamera = true;

    Game.playerMap[Client.id].scoreboard.setText(
        '#1 '+ (Game.leaderboard[1] !== null ? Game.leaderboard[1].score+'-'+Game.leaderboard[1].name : '_______')+
        '\n#2 ' + (Game.leaderboard[2] !== null ? Game.leaderboard[2].score+'-'+Game.leaderboard[2].name : '_______')+
        '\n#3 ' + (Game.leaderboard[3] !== null ? Game.leaderboard[3].score+'-'+Game.leaderboard[3].name : '_______')+
        '\n#4 ' + (Game.leaderboard[4] !== null ? Game.leaderboard[4].score+'-'+Game.leaderboard[4].name : '_______')+
        '\n#5 ' + (Game.leaderboard[5] !== null ? Game.leaderboard[5].score+'-'+Game.leaderboard[5].name : '_______'));
};

// Update the position and rotation of a given remote player
Game.updateTransform = function(id, x, y, rotation, health) {
    if (Game.allPlayersAdded) {
        var player = Game.playerMap[id];
        player.x = x;
        player.y = y;
        player.rotation = rotation;
        player.health = health;

        // Update player's trail emitter
        player.shipTrail.x = x - (Game.playerMap[id].width/2 * Math.cos(Game.playerMap[id].rotation));
        player.shipTrail.y = y - (Game.playerMap[id].height/2 * Math.sin(Game.playerMap[id].rotation));
        // player.shipTrail.rotation = rotation;

        Game.playerMap[id] = player;
        // console.log('player name='+Game.playerMap[id].name);
        if (id === Client.id && player.health <= 0) {
            Game.playerMap[id].destroy();
        }
    }
};

function showPlayerNames() {
    for (var i in Game.playerMap) {
        if (Game.playerMap[i] != null && i !== Client.id) {
            Game.playerMap[i].nameHover.visible = true;
            Game.playerMap[i].nameHover.setText(Game.playerMap[i].name);
            Game.playerMap[i].nameHover.x = Game.playerMap[i].x - (Game.playerMap[i].nameHover.width / 2);
            Game.playerMap[i].nameHover.y = Game.playerMap[i].y - 60;
            Game.playerMap[i].scoreHover.visible = true;
            Game.playerMap[i].scoreHover.setText(Game.playerMap[i].score);
            Game.playerMap[i].scoreHover.x = Game.playerMap[i].x - (Game.playerMap[i].scoreHover.width / 2);
            Game.playerMap[i].scoreHover.y = Game.playerMap[i].y - 90;
        }
    }
}

function removePlayerNames() {
    for (var i in Game.playerMap) {
        if (Game.playerMap[i] != null && Game.playerMap[i].nameHover != null && i !== Client.id) {
            Game.playerMap[i].nameHover.visible = false;
            Game.playerMap[i].scoreHover.visible = false;
        }
    }
}

Game.showBasePrompts = function(){
    Game.playerMap[Client.id].safePromptHover.visible = true;
    Game.playerMap[Client.id].safePromptHover.setText(
        'Store [E]\n'
        + 'Refill 1 bullet: '+Game.bulletReloadCostList[Client.weaponId]+'[R]\n'
        + 'Refill 1 boost: '+Game.boostRefillCost+'[B]');
    Game.playerMap[Client.id].safePromptHover.x = (this.game.camera.width / 2);
    Game.playerMap[Client.id].safePromptHover.y = (this.game.camera.height / 2) + 60;
    Game.playerMap[Client.id].safePromptHover.fixedToCamera = true;
};

Game.unshowBasePrompts = function(){
    Game.playerMap[Client.id].safePromptHover.visible = false;
};

Game.reloadWeapon = function(){
    if (Game.playerMap[Client.id].score >= Game.bulletReloadCostList[Client.weaponId])
    {
        Game.playerMap[Client.id].score -= Game.bulletReloadCostList[Client.weaponId]
        Client.score++;
    }
};

Game.refillBoost = function(){
    if (Game.playerMap[Client.id].score >= Game.boostRefillCost && Game.playerMap[Client.id].boost < Game.maxBoost)
    {
        Client.sendCollect(-Game.boostRefillCost);
        Game.playerMap[Client.id].boost++;
        if (Game.playerMap[Client.id].boost > Game.maxBoost)
        {
            Game.playerMap[Client.id].boost = Game.maxBoost;
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
    Game.removeFromLeaderboard(id);
    Game.playerMap[id].shipTrail.destroy();
    generateDustOnDeath(Game.playerMap[id].x, Game.playerMap[id].y, Game.playerMap[id].score);

    burst(Game.playerMap[id].x, Game.playerMap[id].y);
    playerMap.delete(id);
    Game.playerMap[id].destroy();
    Game.playerDestroyed = true;
    delete Game.playerMap[id];
};

Game.playerKilled = function(thePlayer){
    //Generate the dust dropped from death
    Game.removeFromLeaderboard(id);
    Game.playerMap[id].shipTrail.destroy();
    generateDustOnDeath(Game.playerMap[id].x, Game.playerMap[id].y, Game.playerMap[id].score);
    burst(Game.playerMap[id].x, Game.playerMap[id].y);
    playerMap.delete(thePlayer.id);
    thePlayer.destroy();
    Game.playerDestroyed = true;
    delete thePlayer;
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

Game.setPlayerAcceleration = function(acceleration, isBoost){
    if (Game.allPlayersAdded && Game.playerMap[Client.getPlayerID()].body !== null) {
        if (isBoost && Game.playerMap[Client.id].boost >= Game.boostCost) {
            Game.playerMap[Client.id].body.maxVelocity.set(Game.maxBoostVelocity);
            // Game.playBoostPFX();

            // console.log('we boostin');
            Game.playerMap[Client.id].boost -= Game.boostCost;
            // game.physics.arcade.velocityFromRotation(rotation, weaponArray[weaponId].velocity, bullet.body.velocity);
            game.physics.arcade.accelerationFromRotation(Game.playerMap[Client.id].rotation,
                acceleration * Game.boostAccelMult, Game.playerMap[Client.id].body.acceleration);
        }
        else {
            Game.playerMap[Client.id].body.maxVelocity.set(Game.maxNormVelocity);
            // Game.stopBoostPFX();

            game.physics.arcade.accelerationFromRotation(Game.playerMap[Client.id].rotation,
                acceleration, Game.playerMap[Client.id].body.acceleration);
        }
        /*if (Game.playerMap[Client.id].body.velocity === Game.playerMap[Client.id].body.maxVelocity)
        {
            console.log('at max velocity of '+Game.playerMap[Client.id].body.maxVelocity);
        }*/
    }
};

Game.playBoostPFX = function() {
    Game.playerMap[Client.id].shipTrail.start(false, 5000, 10);
};

Game.stopBoostPFX = function() {
    Game.playerMap[Client.id].shipTrail.kill();
};

Game.setPlayerRotation = function(id, angVelocity){
    if(Game.playerMap[id].body !== null)
        Game.playerMap[id].body.angularVelocity = angVelocity;
};

Game.addNewPlayer = function(id,x,y,rotation,shipName,name,score){
    console.log('Game.addNewPlayer '+id+'--'+name+'--'+shipName);

    Game.shipTrails[id] = game.add.emitter(x, y + Game.playerSize/2, 400);

    var newPlayer;


    // Create player sprite and assign the player a unique ship
    // If it is a new player
    //console.log(shipName.length);
    //console.log(String('unassignedShip').length);
    //console.log(shipName === 'unassignedShip' && id === Client.id);
    if(shipName === 'unassignedShip'){//} && id === Client.id/*Client.getPlayerID()*/){
        var shipSelectionString = assignShip(id + 1);
        // console.log(name + '\'s shipName: '+shipSelectionString);
        newPlayer = game.add.sprite(x,y,shipSelectionString);
        // console.log('if statement - shipSelectionString: ' + shipSelectionString);
        if (id === Client.id)
            Client.sendShipChange(shipSelectionString);
    }
    // If it is an existing player
    else{
        // console.log(name+'\'s shipName: '+shipName);
        newPlayer = game.add.sprite(x,y,shipName);
        // console.log('else statement - shipSelectionString: ' + shipName);
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
    //newPlayer.body.bounce.setTo(.5, .5);
    newPlayer.body.drag.set(100);
    newPlayer.body.maxVelocity.set(Game.maxNormVelocity);

    //  Add an emitter for the ship's trail
    newPlayer.shipTrail = Game.shipTrails[id];
    newPlayer.shipTrail.gravity = 0;
    newPlayer.shipTrail.z = -1000;
    newPlayer.shipTrail.width = 10;
    newPlayer.shipTrail.makeParticles('trail');
    newPlayer.shipTrail.setXSpeed(30, -30);
    newPlayer.shipTrail.setYSpeed(30, -30);
    // newPlayer.shipTrail.setRotation(50,-50);
    newPlayer.shipTrail.setAlpha(1, 0.01, 800);
    newPlayer.shipTrail.setScale(0.05, 0.4, 0.05, 0.4, 2000, Phaser.Easing.Quintic.Out);
    // newPlayer.addChild(newPlayer.shipTrail);
    // newPlayer.shipTrail.rotation = rotation;
    newPlayer.shipTrail.start(false, 2000, 10);


    // Initialize player's health
    newPlayer.heal(100);


    /* newPlayer.shield.setText('Shield:\n' +
         'Bullets: ' + playerHUD["bullets"] + '\n' +
         'Boost: ' + playerHUD["boost"] + '\n' +
         'Currency: ' + playerHUD["currency"], { font: '100px Arial', fill: '#fff' }); */

    // Set the player's score
    // Game.playerHUD["currency"] = score;
    newPlayer.boost = 100;
    newPlayer.score = score;
    // newPlayer.isSafe = true;
    newPlayer.isMoving = false;

    /* newPlayer.shield.setText('Shield:\n' +
         'Bullets: ' + Game.playerHUD["bullets"] + '\n' +
         'Boost: ' + Game.playerHUD["boost"] + '\n' +
         'Currency: ' + Game.playerHUD["currency"], { font: '100px Arial', fill: '#fff' }); */

    // Local player should be instantiated first before remote players

    // Local player should be instantiated first before remote players
    newPlayer.id = id;
    Game.playerMap[id] = newPlayer;
    Game.playerMap[id].shield = Game.add.text(0, 0, '', { font: '35px Lucida Console', fill: '#fff' });
    Game.playerMap[id].nameHover = Game.add.text(0, 0, '', {font: '20px Lucida Console', fill: '#fff'});
    Game.playerMap[id].safePromptHover = Game.add.text(0, 0, '', {font: '20px Lucida Console', fill: '#fff', boundsAlignH: "center"});
    Game.playerMap[id].safePromptHover.anchor.set(0.5,0.5);
    Game.playerMap[id].scoreHover = Game.add.text(0, 0, '', {font: '20px Lucida Console', fill: '#fff'});
    Game.playerMap[id].healthBar = Game.add.graphics(0,0);
    Game.playerMap[id].healthBar.safe = false;
    Game.playerMap[id].prevHealth = -1;
    Game.playerMap[id].scoreboard = Game.add.text(0, 0, '', { font: '35px Lucida Console', fill: '#fff'/*, boundsAlignH: 'right'*/ });
    Game.playerMap[id].scoreboard.anchor.setTo(1, 0);

    //Game.createHealthBar(Game.playerMap[id]);
    playerMap.set(newPlayer.id, newPlayer);
    if (!Game.localPlayerInstantiated) {
        Game.localPlayerInstantiated = true;
    }

    // Set local camera to follow local player sprite
    this.game.camera.follow(Game.playerMap[Client.getPlayerID()], Phaser.Camera.FOLLOW_LOCKON);
    this.game.renderer.renderSession.roundPixels = true;
};

Game.setDeathBehavior = function(id) {
    Game.playerMap[id].events.onKilled.add(function() {
        Client.setClientScores(Game.playerMap[id].score);
        Client.disconnect();
        game.state.start('Menu');
        game.state.clearCurrentState();
    });
};

Game.createHealthBar = function(player){
    player.healthBar = Game.add.graphics(0,0);
    player.healthBar.clear();
    player.healthBar.safe = false;
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

//Particle methods:
// if you want to increase performance edit the final argument of
// bullet.start(true, 1000, null, 2
// this is->   burst  lifetime    amout of particles

//called on bullet removal
function burstLittle(x,y){
    //generating burst
    var burst = game.add.emitter(x, y,100);
    burst.makeParticles('spark');
    //burst.start(true, 1000, null, 2);
}
//called on player death
function burst(x,y){
  //bullet burst
    var burst = game.add.emitter(x, y,20);
    burst.makeParticles('sparksmall');
    //burst.start(true, 3000, null, 25);
};