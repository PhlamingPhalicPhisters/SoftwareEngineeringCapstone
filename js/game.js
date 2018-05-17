var Game = {};

var layer;
var dustList = [];
var weaponArray = [];
function addWeapon(lifespan, velocity, bulletTime, damage) {
    weaponArray.push({lifespan: lifespan, velocity: velocity, bulletTime: bulletTime, damage: damage});
}
// addWeapon(2000, 900, 100, Game.bulletDamage[0]);
// addWeapon(2000, 900, 50, Game.bulletDamage[1]);
// addWeapon(2000, 900, 150, Game.bulletDamage[2]);


var firedBullets = new Map();
var playerMap = new Map();
var bulletID = 0;
var burstLittleEmitter;
var burstBig;


shop = {
    shopMenu: null,
    shopPadding: 12,
    Tiers: [],
    visibleTier: 0,
    tierText: null,
    statText: null,
    nextTierButton: null,
    nextTierButtonHover: false,
    nextTierButtonDown: false,
    prevTierButton: null,
    prevTierButtonHover: false,
    prevTierButtonDown: false,
    tierBox: null,
    ammoBox: null,
    ammoBoxHover: false,
    ammoText: null,
    weaponBox1: null,
    weaponBox1Hover: false,
    weapon1Sprite: null,
    weapon1Text: null,
    weaponBox2: null,
    weaponBox2Hover: false,
    weapon2Sprite: null,
    weapon2Text: null,
    weaponBox3: null,
    weaponBox3Hover: false,
    weapon3Sprite: null,
    weapon3Text: false,
    boostBox: null,
    boostBoxHover: false,
    boostText: false,
    shopCornerX: 0,
    shopCornerY: 0,
    shopWidth: 0,
    shopHeight: 0,
    shipSelect: null
    /*
    scrollBarBackground: null,
    scrollBar: null,
    scrollBarX: 0,
    scrollBarY: 0,
    scrollBarWidth: 0,
    scrollBarHeight: 20,
    scrollBarColor: null,
    scrollBarHover: false*/
};
for (var i = 0; i < 5; i++) {
    var elements = [];
    shop.Tiers.push({elements: []});
}
//Game.dragX = 0;
//Game.dragY = 0;
Game.screenResized = false;


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

    Game.playerMap = {};
    Game.ammoMap = {};

    Game.screenResized = true;
    Game.showFPS = false;

    Game.leaderboard = [null, null, null, null, null, null];

    // Game.playerSize = 64;           // sq. px. size
    Game.isSafe = false;            // local player is in safe zone
    Game.maxNormVelocity = 200;     // maximum body acceleration
    Game.maxBoost = 5000;           // max boost capacity
    Game.maxBoostVelocity = 400;    // maximum body acceleration when boosting
    Game.normalAccel = 300;         // normal player acceleration speed
    Game.boostAccelMult = 10;       // boost acceleration multiplier
    Game.normalAngVel = 300;        // normal player rotation speed
    Game.boostRotMult = 0.5;        // boost rotation mutliplier
    Game.boostCost = 1;             // how much boost costs when active
    Game.prevBoost = -1;
    Game.prevBullets = -1;
    Game.prevDust = -1;
    Game.boostRefillCost = 1;

    Game.tierShipCosts = [5000, 10000, 20000, 30000, 40000];
    Game.buyWeaponCost = [1000, 3000, 2000];
    Game.bulletDamage = [6, 2, 10];
    Game.maxWeaponAmmo = [50, 250, 100];
    Game.bulletReloadCostList = [50, 25, 100];

    Game.inShop = false;
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

    //placeholder tier list
    Game.shipTiers = [];
    Game.shipTiers[0] = ['ship1', 'ship2', 'ship7'];
    Game.shipTiers[0].stats = {health: 100, boost: 5000, speedMultiplier: 1};
    Game.shipTiers[1] = ['ship8', 'ship9', 'ship10'];
    Game.shipTiers[1].stats = {health: 100, boost: 4000, speedMultiplier: 1.5};
    Game.shipTiers[2] = ['ship5', 'ship6', 'ship4'];
    Game.shipTiers[2].stats = {health: 150, boost: 5000, speedMultiplier: 1};
    Game.shipTiers[3] = ['ship13', 'ship12', 'ship11'];
    Game.shipTiers[3].stats = {health: 120, boost: 7000, speedMultiplier: 1.1};
    Game.shipTiers[4] = ['ship14', 'ship15', 'ship3'];
    Game.shipTiers[4].stats = {health: 250, boost: 5000, speedMultiplier: 0.75};

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

    // Load arrow asset
    this.game.load.image('arrow', 'assets/sprites/neon/clickArrow.png');

    this.game.load.image('ship0', 'assets/sprites/neon/squaresquare.png');

    this.game.load.image('arrow', 'assets/sprites/neon/arrow.png');
};

//Helper function for the loading screen
function loadStart() {
    var shiploadsprite = game.add.sprite(game.world.centerX - game.world.width*0.03, game.world.centerY, 'shipload');
    shiploadsprite.height = 75;
    shiploadsprite.width = 75;
    game.stage.backgroundColor = '#000000';
    game.add.text(game.world.centerX+game.world.width*0.03,game.world.centerY, 'Loading...', { fill: '#ffffff' });
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
    // Game.playerMap = {};
    // Game.ammoMap = {};
    Game.allPlayersAdded = false;
    Game.localPlayerInstantiated = false;
    Game.bulletsCreated = false;

    addWeapon(2000, 900, 100, Game.bulletDamage[0]);
    addWeapon(2000, 900, 50, Game.bulletDamage[1]);
    addWeapon(2000, 900, 150, Game.bulletDamage[2]);

    // Set up scaling management
    this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    this.game.scale.pageAlignHorizontally = true;
    this.game.scale.pageAlignVertically = true;
    //console.log(this.game.scale.width + " width");
    //this.game.scale.setGameSize(window.outerWidth * 1.1, window.innerHeight * 1.1);
    // this.game.scale.setMinMax(640,480/*,1920,1080*/);

    // Handle window resizing events every 50ms
    window.addEventListener('resize',function(event){
        clearTimeout(window.resizedFinished);
        window.resizedFinished = setTimeout(function(){
            //console.log('Resize finished');
            Game.rescale();
            //console.log("Resize width: " + Game.width + ", Resize height: " + Game.height);
            Game.screenResized = true;
        }, 50);
    });

    // Set up tile mapping and layer system
    //Name of tilesheet in json, name in game.js
    Game.map = this.game.add.tilemap('map');
    Game.map.addTilesetImage('largetilesheet','tiles');
    Game.map.addTilesetImage('tilemapneonsmall','neon');

    //Order of these statements impacts the order of render
    Game.background = Game.map.createLayer('Backgroundlayer');

    // safeZoneLayer = map.createLayer('Zonelayer');
    Game.safeZone = game.add.sprite(3235,3240,'safe_zone');
    Game.safeZone.width = 1205;
    Game.safeZone.height = 1205;
    Game.safeZone.anchor.setTo(0.5,0.5);
    Game.safeZone.alpha = 0.6;
    Game.layer = Game.map.createLayer('Groundlayer');
    Game.map.setCollisionBetween(0, 4000, true, 'Groundlayer');
    Game.layer.resizeWorld();

    // Enable Phaser Arcade game physics engine
    this.game.physics.startSystem(Phaser.Physics.ARCADE);
    Game.safeZone.enableBody = true;
    Game.physics.enable(Game.safeZone, Phaser.Physics.ARCADE);

    // Create Local player & all active remote players
    Client.askNewPlayer();
    Client.getPlayer();

    Game.rescale();

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
    Game.pointer = new Phaser.Pointer(this.game, 0);

    //bullet.body.setSize(bullet.width,bullet.height,0.5,0.5);
    // publicBulletInfo.bullets.bodies.setCircle(10);
    // Input
    /*cursors = game.input.keyboard.createCursorKeys();
    game.input.keyboard.addKeyCapture([Phaser.Keyboard.SPACEBAR]);*/
    // console.log("Got to creation");
    Game.playerDestroyed = false;

    //generate dust for the player
    generateDustForClient(Client.getPlayerID());
    // console.log("DustList size: " + dustList.length);
    // console.log("Testing the dust list to verify that it loaded correctly, " +
    //     "dust x position: " + dustList[100].positionx);
    Game.playerDestroyed = false;

    burstLittleEmitter = game.add.emitter(0, 0,100);
    burstLittleEmitter.makeParticles('spark');
    burstBig = game.add.emitter(0, 0,20);
    burstBig.makeParticles('sparksmall');


    shop.shopMenu = Game.add.graphics(-1000,-1000);
    shop.scrollBarBackground = Game.add.graphics(-1000,-1000);
    shop.scrollBar = Game.add.graphics(-1000,-1000);
    shop.tierText = Game.add.text(-1000, -1000, 'Tier ' + shop.visibleTier + ':', {font: '35px Lucida Console', fill: '#ffffff', align: 'left'});
    shop.statText = Game.add.text(-1000, -1000, 'Max Health: ' + Game.shipTiers[shop.visibleTier].health + '\n' +
        'Max Boost: ' + Game.shipTiers[shop.visibleTier].boost + '\n' +
        'Speed Multiplier: ' + Game.shipTiers[shop.visibleTier].speedMultiplier, {font: '35px Lucida Console', fill: '#ffffff', align: 'left'});
    shop.ammoText = Game.add.text(-1000, -1000, '', {font: '35px Lucida Console', fill: '#ffffff', align: 'center'});
    shop.weapon1Text = Game.add.text(-1000, -1000, '', {font: '35px Lucida Console', fill: '#ffffff', align: 'center'});
    shop.weapon2Text = Game.add.text(-1000, -1000, '', {font: '35px Lucida Console', fill: '#ffffff', align: 'center'});
    shop.weapon3Text = Game.add.text(-1000, -1000, '', {font: '35px Lucida Console', fill: '#ffffff', align: 'center'});
    shop.boostText = Game.add.text(-1000, -1000, '', {font: '35px Lucida Console', fill: '#ffffff', align: 'center'});
    shop.nextTierButton = Game.add.sprite(-1000, -1000, 'arrow');
    shop.prevTierButton = Game.add.sprite(-1000, -1000, 'arrow');
    shop.tierBox = Game.add.graphics(-1000, -1000);
    shop.ammoBox = Game.add.graphics(-1000, -1000);
    shop.weaponBox1 = Game.add.graphics(-1000, -1000);
    shop.weaponBox2 = Game.add.graphics(-1000, -1000);
    shop.weaponBox3 = Game.add.graphics(-1000, -1000);
    shop.boostBox = Game.add.graphics(-1000, -1000);
    shop.weapon1Sprite = Game.add.sprite(-1000, -1000, 'bullet');
    shop.weapon2Sprite = Game.add.sprite(-1000, -1000, 'bullet1');
    shop.weapon3Sprite = Game.add.sprite(-1000, -1000, 'bullet2');
    shop.weapon1Sprite.visible = false;
    shop.weapon2Sprite.visible = false;
    shop.weapon3Sprite.visible = false;
    for (var i = 0; i < Game.shipTiers.length; i++) {
        if (shop.Tiers[i] !== undefined && shop.Tiers[shop.visibleTier].elements !== undefined) {
            var elements = shop.Tiers[i].elements;
            // add in each ship in the tier and a background box for it
            for (var j = 0; j < Game.shipTiers[i].length; j++) {
                var shipBox = Game.add.graphics(-1000, -1000);
                elements.push(shipBox);
                var ship = Game.add.sprite(-1000, -1000, Game.shipTiers[i][j]);
                elements.push(ship);
            }
        }
    }
    shop.Tiers.forEach(function(tier) {
        tier.elements.forEach(function(element) {
            element.hover = false;
            if (element.type === 3)
                element.clear();
            else
                element.visible = false;
        });
    });
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
    // This is the dust that is spawned when a player dies
    deathDustMap.forEach(function (dust) {
        playerMap.forEach(function (player) {
            Game.physics.arcade.overlap(dust, player, dustCollisionDeath);
        });
    });

    // This for the dust that starts in your game
    playerMap.forEach(function (player) {
        Game.physics.arcade.overlap(dustList, player, dustCollision);
    });

    Game.physics.arcade.collide(Game.layer, dustList);

    Game.physics.arcade.collide(Game.layer, Game.playerMap[Client.getPlayerID()]);

    if (Game.physics.arcade.overlap(Game.safeZone, Game.playerMap[Client.getPlayerID()], Game.enterSafeZone)){}
    else {
        Game.exitSafeZone();
    }

    //Bullet collision
    var bulletErase = [];
    if(firedBullets.size > 0 && !document.hidden && typeof Game.ammoMap[Client.getPlayerID()] !== 'undefined' && Client.getPlayerID() !== -1) {
        firedBullets.forEach(function (bullet) {
            playerMap.forEach(function (player, key) {
                //when the current player is hit with a bullet
                if(key !== bullet.player) {
                    Game.physics.arcade.overlap(player, bullet, function (player, bullet) {
                        bulletErase.push(bullet);
                        player.damage(bullet.damage);
                    });
                }
            });
            //safezone
            Game.physics.arcade.overlap(bullet, Game.safeZone, function (bullet) {
                //burstLittle(bullet.x, bullet.y);
                bulletErase.push(bullet);
            });
            //layer
            Game.physics.arcade.overlap(Game.layer, bullet, function (bullet, layer) {
                if(layer.index !== -1) {
                    //burstLittle(bullet.x, bullet.y);
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
    if (Game.cursors.up.isDown && !Game.inShop)
    {
        Game.setPlayerAcceleration(Game.normalAccel, game.input.keyboard.isDown(Phaser.Keyboard.SHIFT))
    }
    else if (Game.cursors.down.isDown && !Game.inShop)
    {
        Game.setPlayerAcceleration(-Game.normalAccel, game.input.keyboard.isDown(Phaser.Keyboard.SHIFT))
    }
    else
    {
        Game.setPlayerAcceleration(0, false);
    }
    if (Game.cursors.left.isDown && Game.cursors.right.isDown && !Game.inShop) {
        if (Game.cursors.left.isDown && Game.cursors.left.timeDown > Game.cursors.right.timeDown) {
            Client.sendRotation(-300);
        }
        else {
            Client.sendRotation(300);
        }
    }
    else if (Game.cursors.left.isDown && !Game.inShop) {
        Client.sendRotation(-300);
    }
    else if (Game.cursors.right.isDown && !Game.inShop) {
        Client.sendRotation(300);
    }
    else
    {
        Client.sendRotation(0);
    }

    if ((game.input.keyboard.isDown(Phaser.KeyCode.Q) || game.input.keyboard.isDown(Phaser.KeyCode.L)) && !Game.inShop) {
        showPlayerNames();
    }
    else {
        removePlayerNames();
    }

    // Get firing input
    if (!Game.isSafe && game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR))
    {
        fireBullet(Client.getPlayerID());
    }

    if (Game.allPlayersAdded) {
        if (Game.isSafe) {
            Game.showBasePrompts();

            if (game.input.keyboard.isDown(Phaser.KeyCode.E)) {
                //Game.requestShipUpgrade();
                Game.holdingE = true;
            }
            else {
                Game.holdingE = false;
            }
            if (Game.inShop && !Game.holdingE) {
                Game.updateShop();
                Game.playerMap[Client.id].body.maxVelocity.set(0);
            }
            else {
                Game.clearShop();
                if (Game.playerMap[Client.id].body.maxVelocity === 0)
                    Game.playerMap[Client.id].body.maxVelocity.set(Game.maxNormVelocity);
            }
            if (game.input.keyboard.isDown(Phaser.KeyCode.R)) {
                Game.reloadWeapon();
            }
            if (game.input.keyboard.isDown(Phaser.KeyCode.B)) {
                Game.refillBoost();
            }
            if (game.input.keyboard.isDown(Phaser.KeyCode.V)){
                // Game.playerMap[Client.id].shipName = 'ship0';
                // Game.updatePlayerShip(Client.id,'ship0');
                // Client.sendShipChange('ship0');
                // Game.playerMap[Client.id].maxHealth = 500;
                // Game.playerMap[Client.id].heal(500);
                // Game.MaxBoost
                shipTierAssign('ship15');
            }
            if (game.input.keyboard.isDown(Phaser.KeyCode.NUMPAD_1)) {
                Client.changeWeapon(Game.maxWeaponAmmo[0], 0);
            }
            if (game.input.keyboard.isDown(Phaser.KeyCode.NUMPAD_2)) {
                Client.changeWeapon(Game.maxWeaponAmmo[1], 1);
            }
            if (game.input.keyboard.isDown(Phaser.KeyCode.NUMPAD_3)) {
                Client.changeWeapon(Game.maxWeaponAmmo[2], 2);
            }
        }
        else {
            Game.unshowBasePrompts();
            if (Game.inShop) {
                Game.clearShop();
                Game.inShop = false;
            }
        }
    }

    if (game.input.keyboard.isDown(Phaser.Keyboard.ESC) && Game.playerMap[Client.id] !== undefined)
    {
        Game.clearShop();
        Game.playerMap[Client.id].kill();
    }

    if (game.input.keyboard.isDown(Phaser.Keyboard.F) && game.input.keyboard.isDown(Phaser.Keyboard.P) && game.input.keyboard.isDown(Phaser.Keyboard.S))
    {
        Game.showFPS = !Game.showFPS;
    }

    // Sync the transform of remote instances of this player
    // Send transform also handles the amount of health and the hud display
    // Inside of the health tracker when a player dies dust is dropped
    Game.sendTransform();
};

window.addEventListener("keypress", function(event) {
    if (event.code === 'KeyE' && Game.isSafe) {
        Game.inShop = !Game.inShop;
    }
});

Game.updateShop = function() {
    shop.shopWidth = window.innerWidth * 0.8;
    shop.shopHeight = shop.shopWidth * 0.5;
    shop.shopCornerX = (1 - (shop.shopWidth / window.innerWidth)) * window.innerWidth / 2;
    shop.shopCornerY = (1 - (shop.shopHeight / window.innerHeight)) * window.innerHeight / 2;
    shop.shopPadding = shop.shopWidth / 128;
    if (shop.shopCornerY < 0) {
        shop.shopCornerY = 0;
    }
    shop.shopMenu.clear();
    var color = Game.playerMap[Client.id].tint;
    shop.shopMenu.beginFill(color, 1);
    shop.shopMenu.drawRect(shop.shopCornerX, shop.shopCornerY, shop.shopWidth, shop.shopHeight);
    shop.shopMenu.endFill();
    shop.shopMenu.x = 0;
    shop.shopMenu.y = 0;
    Game.world.bringToTop(shop.shopMenu);
    shop.shopMenu.fixedToCamera = true;

    // draw the big box behind all the ship display items as a background
    shop.tierBox.clear();
    color = Game.rgbToHex(25, 25, 25);
    shop.tierBox.beginFill(color);
    shop.tierBox.drawRect(shop.shopCornerX + shop.shopPadding, shop.shopCornerY + shop.shopPadding, shop.shopWidth - 2*shop.shopPadding, (shop.shopHeight * 2/3) - 2*shop.shopPadding);
    shop.tierBox.endFill();
    shop.tierBox.x = 0;
    shop.tierBox.y = 0;
    Game.world.bringToTop(shop.tierBox);
    shop.tierBox.fixedToCamera = true;

    // draw text
    shop.tierText.setText('Tier ' + (shop.visibleTier + 1) + ':');
    shop.tierText.fontSize = shop.shopWidth / 20;
    shop.tierText.x = shop.shopCornerX + 2*shop.shopPadding;
    shop.tierText.y = shop.shopCornerY + 2*shop.shopPadding;
    shop.tierText.fixedToCamera = true;
    shop.tierText.visible = true;

    if (shop.visibleTier === 0)
        shop.statText.setText('Max Health, Ammo, and Boost Multiplier: ' + 1 + 'x\n'
            + 'Speed: 300');
    else if (shop.visibleTier === 1)
        shop.statText.setText('Max Health, Ammo, and Boost Multiplier: ' + tierTwoMultiplier + 'x\n'
            + 'Speed: 300');
    else if (shop.visibleTier === 2)
        shop.statText.setText('Max Health, Ammo, and Boost Multiplier: ' + tierThreeMultiplier + 'x\n'
            + 'Speed: 350');
    else if (shop.visibleTier === 3)
        shop.statText.setText('Max Health, Ammo, and Boost Multiplier: ' + tierFourMultiplier + 'x\n'
            + 'Speed: 400');
    else
        shop.statText.setText('Max Health, Ammo, and Boost Multiplier: ' + tierFiveMultiplier + 'x\n'
            + 'Speed: 400');
    shop.statText.fontSize = shop.shopWidth / 50;
    shop.statText.x = shop.shopCornerX + shop.tierText.width + 3*shop.shopPadding;
    shop.statText.y = shop.shopCornerY + 2*shop.shopPadding;
    shop.statText.fixedToCamera = true;
    shop.statText.visible = true;

    // create the next tier button
    shop.nextTierButton.inputEnabled = true;
    shop.nextTierButton.events.onInputOver.add(function() {
        shop.nextTierButtonHover = true;
    });
    shop.nextTierButton.events.onInputOut.add(function() {
        shop.nextTierButtonHover = false;
    });
    shop.nextTierButton.events.onInputDown.add(function() {
        shop.nextTierButtonDown = true;
        shop.Tiers[shop.visibleTier].elements.forEach(function(element) {
            //console.log(element.type);
            if (element.type === 3)
                element.clear();
            else
                element.visible = false;
        });
        /*if (shop.visibleTier === 4)
            shop.visibleTier = 0;
        else
            shop.visibleTier++;*/
    });
    if (shop.nextTierButtonDown) {
        if (shop.visibleTier === 4)
            shop.visibleTier = 0;
        else
            shop.visibleTier++;
        shop.nextTierButtonDown = false;
    }
    if(shop.nextTierButtonHover)
        shop.nextTierButton.tint = 2*Game.playerMap[Client.id].tint;
    else
        shop.nextTierButton.tint = Game.playerMap[Client.id].tint;
    shop.nextTierButton.scale.setTo(1.0, 1.0);
    var scale = (shop.shopPadding*3.5) / shop.nextTierButton.width;
    shop.nextTierButton.scale.setTo(scale, scale);
    shop.nextTierButton.anchor.x = 0.5;
    shop.nextTierButton.anchor.y = 0.5;
    shop.nextTierButton.x = shop.shopCornerX + shop.tierBox.width - shop.nextTierButton.width / 2;
    shop.nextTierButton.y = shop.shopCornerY + shop.shopPadding + (shop.tierBox.height + shop.statText.height) / 2;
    shop.nextTierButton.fixedToCamera = true;
    shop.nextTierButton.visible = true;

    // create the previous tier button
    shop.prevTierButton.angle = 180;
    shop.prevTierButton.inputEnabled = true;
    shop.prevTierButton.events.onInputOver.add(function() {
        shop.prevTierButtonHover = true;
    });
    shop.prevTierButton.events.onInputOut.add(function() {
        shop.prevTierButtonHover = false;
    });
    shop.prevTierButton.events.onInputDown.add(function() {
        shop.prevTierButtonDown = true;
        shop.Tiers[shop.visibleTier].elements.forEach(function(element) {
            //console.log(element.type);
            if (element.type === 3)
                element.clear();
            else
                element.visible = false;
        });
        /*if (shop.visibleTier === 0)
            shop.visibleTier = 4;
        else
            shop.visibleTier--;*/
    });
    if (shop.prevTierButtonDown) {
        if (shop.visibleTier === 0)
            shop.visibleTier = 4;
        else
            shop.visibleTier--;
        shop.prevTierButtonDown = false;
    }
    if(shop.prevTierButtonHover)
        shop.prevTierButton.tint = 2*Game.playerMap[Client.id].tint;
    else
        shop.prevTierButton.tint = Game.playerMap[Client.id].tint;
    shop.prevTierButton.scale.setTo(1.0, 1.0);
    var scale = (shop.shopPadding*3.5) / shop.prevTierButton.width;
    shop.prevTierButton.scale.setTo(scale, scale);
    shop.prevTierButton.anchor.x = 0.5;
    shop.prevTierButton.anchor.y = 0.5;
    shop.prevTierButton.x = shop.shopCornerX + 2*shop.shopPadding + shop.nextTierButton.width / 2;
    shop.prevTierButton.y = shop.shopCornerY + shop.shopPadding + (shop.tierBox.height + shop.statText.height) / 2;
    shop.prevTierButton.fixedToCamera = true;
    shop.prevTierButton.visible = true;

    // draw the background boxes (even indices of array) for the ships in the visible tier
    var elements = shop.Tiers[shop.visibleTier].elements;
    for (var i = 0; i < elements.length; i += 2) {
        if (elements[i] === shop.shipSelect) {
            shipTierAssign(Game.shipTiers[shop.visibleTier][i/2]);
            console.log(Game.shipTiers[shop.visibleTier][i/2]);
            shop.shipSelect = null;
        }
        elements[i].clear();
        elements[i].inputEnabled = true;
        elements[i].events.onInputOver.add(function(element) {
            element.hover = true;
        });
        elements[i].events.onInputOut.add(function(element) {
            element.hover = false;
        });
        elements[i].events.onInputUp.add(function(element) {
            shop.shipSelect = element;
        });
        if (elements[i].hover)
            color = Game.rgbToHex(30, 30, 30);
        else
            color = Game.rgbToHex(50, 50, 50);
        elements[i].beginFill(color);
        var width = (shop.tierBox.width - shop.prevTierButton.width - shop.nextTierButton.width - 4*shop.shopPadding) / (elements.length / 2) - shop.shopPadding;
        var height = shop.tierBox.height - shop.statText.height - 4*shop.shopPadding;
        elements[i].drawRect(shop.shopCornerX + shop.prevTierButton.width + 3.5*shop.shopPadding + (i/2)*width + (i/2)*shop.shopPadding, shop.shopCornerY + shop.statText.height + 3*shop.shopPadding,
            width, height);
        elements[i].endFill();
        elements[i].x = 0;
        elements[i].y = 0;
        Game.world.bringToTop(elements[i]);
        elements[i].fixedToCamera = true;
    }
    // draw the ship sprites (odd indices of array) for the ships in the visible tier
    for (var i = 1; i < elements.length; i += 2) {
        elements[i].scale.setTo(1, 1);
        elements[i].anchor.x = 0.5;
        elements[i].anchor.y = 0.5;
        var width = (shop.tierBox.width - shop.prevTierButton.width - shop.nextTierButton.width - 4*shop.shopPadding) / (elements.length / 2) - shop.shopPadding;
        var height = shop.tierBox.height - shop.statText.height - 4*shop.shopPadding;
        var scale = (width/2) / elements[i].width;
        elements[i].scale.setTo(scale, scale);
        elements[i].x = shop.shopCornerX + shop.prevTierButton.width + 3.5*shop.shopPadding + Math.floor(i/2)*width + (i/2)*shop.shopPadding + width/2;
        elements[i].y = shop.shopCornerY + shop.statText.height + 3*shop.shopPadding + height/2;
        Game.world.bringToTop(elements[i]);
        elements[i].fixedToCamera = true;
        elements[i].visible = true;
    }

    // draw the box behind the ammo refill as a background
    shop.ammoBox.clear();
    shop.ammoBox.inputEnabled = true;
    shop.ammoBox.events.onInputOver.add(function() {
        shop.ammoBoxHover = true;
    });
    shop.ammoBox.events.onInputOut.add(function() {
        shop.ammoBoxHover = false;
    });
    shop.ammoBox.events.onInputUp.add(function() {
        Game.reloadWeapon();
    });
    color = Game.rgbToHex(25, 25, 25);
    if (shop.ammoBoxHover)
        color = Game.rgbToHex(50, 50, 50);
    shop.ammoBox.beginFill(color);
    shop.ammoBox.drawRect(shop.shopCornerX + shop.shopPadding, shop.shopCornerY + (shop.shopHeight * 2/3), (shop.shopWidth - 6*shop.shopPadding) / 5, (shop.shopHeight / 3) - shop.shopPadding);
    shop.ammoBox.endFill();
    shop.ammoBox.x = 0;
    shop.ammoBox.y = 0;
    Game.world.bringToTop(shop.ammoBox);
    shop.ammoBox.fixedToCamera = true;

    // draw ammo refill text
    shop.ammoText.setText(Game.calcAmmoRefillPrompt(false));
    shop.ammoText.fontSize = shop.ammoBox.width / 7.5;
    shop.ammoText.wordWrap = true;
    shop.ammoText.wordWrapWidth = shop.ammoBox.width;
    shop.ammoText.anchor.x = 0.5;
    shop.ammoText.anchor.y = 0.5;
    shop.ammoText.x = shop.shopCornerX + 2*shop.shopPadding + (shop.ammoBox.width - 2*shop.shopPadding) / 2;
    shop.ammoText.y = shop.shopCornerY + (shop.shopHeight * 2/3) + shop.ammoBox.height / 2;
    shop.ammoText.fixedToCamera = true;
    shop.ammoText.visible = true;

    // draw the box behind the weapon info as a background
    shop.weaponBox1.clear();
    shop.weaponBox1.inputEnabled = true;
    shop.weaponBox1.events.onInputOver.add(function() {
        shop.weaponBox1Hover = true;
    });
    shop.weaponBox1.events.onInputOut.add(function() {
        shop.weaponBox1Hover = false;
    });
    shop.weaponBox1.events.onInputUp.add(function() {
        if (Game.buyWeaponCost[0] <= Client.score) {
            Client.sendCollect(-Game.buyWeaponCost[0]);
            Client.changeWeapon(Game.maxWeaponAmmo[0], 0);
        }
    });
    color = Game.rgbToHex(25, 25, 25);
    if (shop.weaponBox1Hover)
        color = Game.rgbToHex(50, 50, 50);
    shop.weaponBox1.beginFill(color);
    shop.weaponBox1.drawRect(shop.shopCornerX + shop.ammoBox.width + 2*shop.shopPadding, shop.shopCornerY + (shop.shopHeight * 2/3), (shop.shopWidth - 6*shop.shopPadding) / 5, (shop.shopHeight / 3) - shop.shopPadding);
    shop.weaponBox1.endFill();
    shop.weaponBox1.x = 0;
    shop.weaponBox1.y = 0;
    Game.world.bringToTop(shop.weaponBox1);
    shop.weaponBox1.fixedToCamera = true;

    // draw the first weapon sprite
    shop.weapon1Sprite.scale.setTo(1.0, 1.0);
    var scale = (shop.shopPadding*5) / shop.weapon1Sprite.width;
    shop.weapon1Sprite.scale.setTo(scale, scale);
    shop.weapon1Sprite.anchor.x = 0.5;
    shop.weapon1Sprite.x = shop.shopCornerX + 1.5*shop.ammoBox.width + 2*shop.shopPadding;
    shop.weapon1Sprite.y = shop.shopCornerY + (shop.shopHeight * 2/3) + shop.shopPadding;
    Game.world.bringToTop(shop.weapon1Sprite);
    shop.weapon1Sprite.visible = true;
    shop.weapon1Sprite.fixedToCamera = true;

    // draw the text for the first weapon
    if (Client.weaponId === 0) {
        shop.weapon1Text.setText('Weapon 1:\nDamage: ' + weaponArray[0].damage + '\nMax Ammo: ' + Game.maxWeaponAmmo[0]);
        shop.weapon1Text.tint = Game.rgbToHex(255, 255, 0);
    }
    else {
        shop.weapon1Text.setText('Weapon 1:\nDamage: ' + weaponArray[0].damage + '\nMax Ammo: ' + Game.maxWeaponAmmo[0] + '\n(' + Game.buyWeaponCost[0] + ' dust)');
        if (Game.buyWeaponCost[0] > Client.score)
            shop.weapon1Text.tint = Game.rgbToHex(100, 100, 100);
        else
            shop.weapon1Text.tint = Game.rgbToHex(255, 255, 255);
    }
    shop.weapon1Text.fontSize = shop.weaponBox1.width / 10;
    shop.weapon1Text.anchor.x = 0.5;
    shop.weapon1Text.anchor.y = 1.0;
    shop.weapon1Text.x = shop.weapon1Sprite.x;
    shop.weapon1Text.y = shop.shopCornerY + (shop.shopHeight * 2/3) + shop.weaponBox1.height - shop.shopPadding;
    shop.weapon1Text.fixedToCamera = true;
    shop.weapon1Text.visible = true;

    // draw the box behind the weapon info as a background
    shop.weaponBox2.clear();
    shop.weaponBox2.inputEnabled = true;
    shop.weaponBox2.events.onInputOver.add(function() {
        shop.weaponBox2Hover = true;
    });
    shop.weaponBox2.events.onInputOut.add(function() {
        shop.weaponBox2Hover = false;
    });
    shop.weaponBox2.events.onInputUp.add(function() {
        if (Game.buyWeaponCost[1] <= Client.score) {
            Client.sendCollect(-Game.buyWeaponCost[1]);
            Client.changeWeapon(Game.maxWeaponAmmo[1], 1);
        }
    });
    color = Game.rgbToHex(25, 25, 25);
    if (shop.weaponBox2Hover)
        color = Game.rgbToHex(50, 50, 50);
    shop.weaponBox2.beginFill(color);
    shop.weaponBox2.drawRect(shop.shopCornerX + 2*shop.ammoBox.width + 3*shop.shopPadding, shop.shopCornerY + (shop.shopHeight * 2/3), (shop.shopWidth - 6*shop.shopPadding) / 5, (shop.shopHeight / 3) - shop.shopPadding);
    shop.weaponBox2.endFill();
    shop.weaponBox2.x = 0;
    shop.weaponBox2.y = 0;
    Game.world.bringToTop(shop.weaponBox2);
    shop.weaponBox2.fixedToCamera = true;

    // draw the second weapon sprite
    shop.weapon2Sprite.scale.setTo(1.0, 1.0);
    var scale = (shop.shopPadding*5) / shop.weapon2Sprite.width;
    shop.weapon2Sprite.scale.setTo(scale, scale);
    shop.weapon2Sprite.anchor.x = 0.5;
    shop.weapon2Sprite.x = shop.shopCornerX + 2.5*shop.ammoBox.width + 3*shop.shopPadding;
    shop.weapon2Sprite.y = shop.shopCornerY + (shop.shopHeight * 2/3) + shop.shopPadding;
    Game.world.bringToTop(shop.weapon2Sprite);
    shop.weapon2Sprite.visible = true;
    shop.weapon2Sprite.fixedToCamera = true;

    // draw the text for the second weapon
    if (Client.weaponId === 1) {
        shop.weapon2Text.setText('Weapon 2:\nDamage: ' + weaponArray[1].damage + '\nMax Ammo: ' + Game.maxWeaponAmmo[1]);
        shop.weapon2Text.tint = Game.rgbToHex(255, 255, 0);
    }
    else {
        shop.weapon2Text.setText('Weapon 2:\nDamage: ' + weaponArray[1].damage + '\nMax Ammo: ' + Game.maxWeaponAmmo[1] + '\n(' + Game.buyWeaponCost[1] + ' dust)');
        if (Game.buyWeaponCost[1] > Client.score)
            shop.weapon2Text.tint = Game.rgbToHex(100, 100, 100);
        else
            shop.weapon2Text.tint = Game.rgbToHex(255, 255, 255);
    }
    shop.weapon2Text.fontSize = shop.weaponBox2.width / 10;
    shop.weapon2Text.anchor.x = 0.5;
    shop.weapon2Text.anchor.y = 1.0;
    shop.weapon2Text.x = shop.weapon2Sprite.x;
    shop.weapon2Text.y = shop.shopCornerY + (shop.shopHeight * 2/3) + shop.weaponBox2.height - shop.shopPadding;
    shop.weapon2Text.fixedToCamera = true;
    shop.weapon2Text.visible = true;

    // draw the box behind the weapon info as a background
    shop.weaponBox3.clear();
    shop.weaponBox3.inputEnabled = true;
    shop.weaponBox3.events.onInputOver.add(function() {
        shop.weaponBox3Hover = true;
    });
    shop.weaponBox3.events.onInputOut.add(function() {
        shop.weaponBox3Hover = false;
    });
    shop.weaponBox3.events.onInputUp.add(function() {
        if (Game.buyWeaponCost[2] <= Client.score) {
            Client.sendCollect(-Game.buyWeaponCost[2]);
            Client.changeWeapon(Game.maxWeaponAmmo[2], 2);
        }
    });
    color = Game.rgbToHex(25, 25, 25);
    if (shop.weaponBox3Hover)
        color = Game.rgbToHex(50, 50, 50);
    shop.weaponBox3.beginFill(color);
    shop.weaponBox3.drawRect(shop.shopCornerX + 3*shop.ammoBox.width + 4*shop.shopPadding, shop.shopCornerY + (shop.shopHeight * 2/3), (shop.shopWidth - 6*shop.shopPadding) / 5, (shop.shopHeight / 3) - shop.shopPadding);
    shop.weaponBox3.endFill();
    shop.weaponBox3.x = 0;
    shop.weaponBox3.y = 0;
    Game.world.bringToTop(shop.weaponBox3);
    shop.weaponBox3.fixedToCamera = true;

    // draw the third weapon sprite
    shop.weapon3Sprite.scale.setTo(1.0, 1.0);
    var scale = (shop.shopPadding*5) / shop.weapon3Sprite.width;
    shop.weapon3Sprite.scale.setTo(scale, scale);
    shop.weapon3Sprite.anchor.x = 0.5;
    shop.weapon3Sprite.x = shop.shopCornerX + 3.5*shop.ammoBox.width + 4*shop.shopPadding;
    shop.weapon3Sprite.y = shop.shopCornerY + (shop.shopHeight * 2/3) + shop.shopPadding;
    Game.world.bringToTop(shop.weapon3Sprite);
    shop.weapon3Sprite.visible = true;
    shop.weapon3Sprite.fixedToCamera = true;

    // draw the text for the third weapon
    if (Client.weaponId === 2) {
        shop.weapon3Text.setText('Weapon 1:\nDamage: ' + weaponArray[2].damage + '\nMax Ammo: ' + Game.maxWeaponAmmo[2]);
        shop.weapon3Text.tint = Game.rgbToHex(255, 255, 0);
    }
    else {
        shop.weapon3Text.setText('Weapon 1:\nDamage: ' + weaponArray[2].damage + '\nMax Ammo: ' + Game.maxWeaponAmmo[2] + '\n(' + Game.buyWeaponCost[2] + ' dust)');
        if (Game.buyWeaponCost[2] > Client.score)
            shop.weapon3Text.tint = Game.rgbToHex(100, 100, 100);
        else
            shop.weapon3Text.tint = Game.rgbToHex(255, 255, 255);
    }
    shop.weapon3Text.fontSize = shop.weaponBox1.width / 10;
    shop.weapon3Text.anchor.x = 0.5;
    shop.weapon3Text.anchor.y = 1.0;
    shop.weapon3Text.x = shop.weapon3Sprite.x;
    shop.weapon3Text.y = shop.shopCornerY + (shop.shopHeight * 2/3) + shop.weaponBox3.height - shop.shopPadding;
    shop.weapon3Text.fixedToCamera = true;
    shop.weapon3Text.visible = true;

    // draw the box behind the boost refill as a background
    shop.boostBox.clear();
    shop.boostBox.inputEnabled = true;
    shop.boostBox.events.onInputOver.add(function() {
        shop.boostBoxHover = true;
    });
    shop.boostBox.events.onInputOut.add(function() {
        shop.boostBoxHover = false;
    });
    shop.boostBox.events.onInputUp.add(function() {
        Game.refillBoost();
    });
    color = Game.rgbToHex(25, 25, 25);
    if (shop.boostBoxHover)
        color = Game.rgbToHex(50, 50, 50);
    shop.boostBox.beginFill(color);
    shop.boostBox.drawRect(shop.shopCornerX + 4*shop.ammoBox.width + 5*shop.shopPadding, shop.shopCornerY + (shop.shopHeight * 2/3), (shop.shopWidth - 6*shop.shopPadding) / 5, (shop.shopHeight / 3) - shop.shopPadding);
    shop.boostBox.endFill();
    shop.boostBox.x = 0;
    shop.boostBox.y = 0;
    Game.world.bringToTop(shop.boostBox);
    shop.boostBox.fixedToCamera = true;

    // draw boost refill text
    shop.boostText.setText(Game.calcBoostRefillPrompt(false));
    shop.boostText.fontSize = shop.ammoBox.width / 7.5;
    shop.boostText.wordWrap = true;
    shop.boostText.wordWrapWidth = shop.ammoBox.width;
    shop.boostText.anchor.x = 0.5;
    shop.boostText.anchor.y = 0.5;
    shop.boostText.x = shop.shopCornerX + 4*shop.ammoBox.width + 6*shop.shopPadding + (shop.boostBox.width - 2*shop.shopPadding) / 2;
    shop.boostText.y = shop.shopCornerY + (shop.shopHeight * 2/3) + shop.boostBox.height / 2;
    shop.boostText.fixedToCamera = true;
    shop.boostText.visible = true;

    //var elements = shop.Tiers[shop.visibleTier].elements;

    /*
    shop.scrollBarBackground.clear();
    color = Game.rgbToHex(75, 75, 75);
    shop.scrollBarBackground.beginFill(color, 1);
    shop.scrollBarBackground.moveTo(0, 0);
    shop.scrollBarBackground.drawRect(window.innerWidth/8 + 15, window.innerHeight/8 + shop.shopMenu.height - 35, shop.shopMenu.width - 30, 20);
    shop.scrollBarBackground.endFill();
    shop.scrollBarBackground.x = 0;
    shop.scrollBarBackground.y = 0;
    Game.world.bringToTop(shop.scrollBarBackground);
    shop.scrollBarBackground.fixedToCamera = true;

    shop.scrollBar.clear();
    shop.scrollBar.inputEnabled = true;
    shop.scrollBar.input.enableDrag();
    shop.scrollBar.events.onDragStart.add(onDragDown, this);
    shop.scrollBar.events.onDragUpdate.add(onDragUpdate, this);
    shop.scrollBar.events.onDragStop.add(onDragStop, this);
    shop.scrollBar.events.onInputOver.add(function() {
        shop.scrollBarHover = true;
    });
    shop.scrollBar.events.onInputOut.add(function() {
        shop.scrollBarHover = false;
    });
    if (shop.scrollBarHover) {
        shop.scrollBarColor = Game.rgbToHex(15, 15, 15);
    }
    else {
        shop.scrollBarColor = Game.rgbToHex(30, 30, 30);
    }
    shop.scrollBar.beginFill(shop.scrollBarColor, 1);
    shop.scrollBar.moveTo(0, 0);
    shop.scrollBarWidth = 100;
    shop.scrollBar.drawRect(window.innerWidth/8 + 15 + shop.scrollBarX, window.innerHeight/8 + shop.shopMenu.height - 35 + shop.scrollBarY, shop.scrollBarWidth , shop.scrollBarHeight);
    shop.scrollBar.endFill();
    shop.scrollBar.x = 0;
    shop.scrollBar.y = 0;
    Game.world.bringToTop(shop.scrollBar);
    shop.scrollBar.fixedToCamera = true;
    */
};
/*function onDragDown(sprite, pointer) {
    Game.dragX = pointer.x - (window.innerWidth/8 + 15 + shop.scrollBarX);
}
function onDragUpdate(sprite, pointer) {
    if (pointer.x - Game.dragX >= window.innerWidth/8 + 15 && pointer.x - Game.dragX <= window.innerWidth/8 + shop.shopMenu.width - 15 - shop.scrollBarWidth)
        shop.scrollBarX = (pointer.x - Game.dragX) - (window.innerWidth/8 + 15);
    else {
        if (pointer.x - Game.dragX < window.innerWidth/8 + 15)
            shop.scrollBarX = 0;
        else
            shop.scrollBarX = shop.scrollBarBackground.width - shop.scrollBarWidth;
    }
}
function onDragStop(sprite, pointer) {
    if (pointer.x - Game.dragX >= window.innerWidth/8 + 15 && pointer.x - Game.dragX <= shop.shopMenu.width - 30 - shop.scrollBarWidth)
        shop.scrollBarX = (pointer.x - Game.dragX) - (window.innerWidth/8 + 15);
    else {
        if (pointer.x - Game.dragX < window.innerWidth/8 + 15)
            shop.scrollBarX = 0;
        else
            shop.scrollBarX = shop.scrollBarBackground.width - shop.scrollBarWidth;
    }
}*/

Game.clearShop = function() {
    shop.shopMenu.clear();
    shop.tierText.visible = false;
    shop.statText.visible = false;
    shop.prevTierButton.visible = false;
    shop.nextTierButton.visible = false;
    shop.ammoText.visible = false;
    shop.weapon1Text.visible = false;
    shop.weapon2Text.visible = false;
    shop.weapon3Text.visible = false;
    shop.boostText.visible = false;
    shop.tierBox.clear();
    shop.ammoBox.clear();
    shop.weaponBox1.clear();
    shop.weaponBox2.clear();
    shop.weaponBox3.clear();
    shop.boostBox.clear();
    shop.weapon1Sprite.visible = false;
    shop.weapon2Sprite.visible = false;
    shop.weapon3Sprite.visible = false;
    if (shop.Tiers[shop.visibleTier] !== undefined && shop.Tiers[shop.visibleTier].elements !== undefined) {
        shop.Tiers[shop.visibleTier].elements.forEach(function (element) {
            //console.log(element.type);
            if (element.type === 3)
                element.clear();
            else
                element.visible = false;
        });
    }


Game.render = function(){
    /*if (Game.allPlayersAdded) {
        game.debug.body(Game.playerMap[Client.getPlayerID()]);
    }*/
    if (Game.showFPS)
    {
        game.debug.text(game.time.fps, 2, 14, "#00ff00");
    }
};

    /*shop.Tiers.forEach(function(tier) {
        tier.elements.forEach(function(element) {
            //console.log(element.type);
            if (element.type === 3)
                element.clear();
            else
                element.exists = false;
        });
    });*/
    //shop.scrollBarBackground.clear();
    //shop.scrollBar.clear();
};

Game.enterSafeZone = function(safeZone, player){
    Game.isSafe = true;
    // Client.sendCollect(5);
};

Game.exitSafeZone = function() {
    Game.isSafe = false;
};

Game.updateScore = function(id, value) {
    if (Game.playerMap[id] !== undefined) {
        Game.playerMap[id].score = value;
    }
    // Game.playerHUD["currency"] = value;
};

Game.updateName = function(id, name){  //This never gets called?
    Game.playerMap[id].name = name;
    //console.log("It the name boi: " + Game.playerMap[id].name);
};

function fireBullet(id) {
    if (game.time.now > Game.ammoMap[Client.id].bulletTime && Client.weaponId !== -1) {
        var bullet = Game.ammoMap[Client.id].getFirstExists(false);

        if (Game.playerMap[Client.id] !== undefined && bullet && Client.ammo > 0) {
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
            bullet.events.onDestroy.add(function() {
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
            bullet.events.onDestroy.add(function() {
                burstLittle(bullet.x, bullet.y);
                firedBullets.delete(bullet.id);
                bullet.destroy();
            }, this);
        }
    }
};

Game.updateAmmo = function(id, ammo, weaponId) {
    if (Game.ammoMap[id] === undefined)
    {
        Game.ammoMap[id] = game.add.group();
    }
    else
    {
        Game.ammoMap[id].removeAll(true);
    }
    // Game.ammoMap[id] = game.add.group();
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

        Client.sendTransform(player.x, player.y, player.rotation, player.health, player.isBoosting);
    }
};


// Update the position and rotation of a given remote player
Game.updateTransform = function(id, x, y, rotation, health, isBoosting) {
    if (Game.allPlayersAdded && Game.playerMap[id] !== undefined) {
        var player = Game.playerMap[id];
        player.x = x;
        player.y = y;
        player.rotation = rotation;
        player.health = health;

        // Update player's trail emitter
        player.shipTrail.x = x - (Game.playerMap[id].width/2 * Math.cos(Game.playerMap[id].rotation));
        player.shipTrail.y = y - (Game.playerMap[id].height/2 * Math.sin(Game.playerMap[id].rotation));
        // player.shipTrail.rotation = rotation;

        if (player.shipTrail.isBoosting !== isBoosting) {
            if (isBoosting) {
                player.shipTrail.setScale(0.5, 0.8, 0.5, 0.8, 1000, Phaser.Easing.Quintic.Out);
            }
            else {
                player.shipTrail.setScale(0.05, 0.4, 0.05, 0.4, 2000, Phaser.Easing.Quintic.Out);
            }
            player.shipTrail.isBoosting = isBoosting;
        }

        Game.playerMap[id] = player;
        // console.log('player name='+Game.playerMap[id].name);
        if (id === Client.id && player.health <= 0) {
            Game.playerMap[id].destroy();
        }
    }
};

Game.updateHUD = function(player){
    //player.shield.x = player.x - ((window.innerWidth / 2) - 20);
    //player.shield.y = player.y - ((window.innerHeight / 2) - 20);

    //player.shield.destroy();
    //player.shield = Game.add.text(0, 0, '', {font: 'Lucida Console', fontSize: this.game.camera.width * .01, fill: '#fff' });
    var changeFlag = false;
    player.shield.x = (this.game.camera.width / 2) - ((this.game.camera.width / 2) - 20);
    player.shield.y = (this.game.camera.height / 2) - ((this.game.camera.height / 2) - 20);
    Game.world.bringToTop(player.shield);
    Game.world.moveDown(player.shield);
    player.shield.fixedToCamera = true;

    player.nameHover.setText(player.name);
    player.nameHover.x = (this.game.camera.width / 2) - (player.nameHover.width / 2);
    player.nameHover.y = (this.game.camera.height / 2) - 60;
    Game.world.bringToTop(player.nameHover);
    Game.world.moveDown(player.nameHover);
    player.nameHover.fixedToCamera = true;

    player.scoreHover.setText('Score: ' + player.score);
    player.scoreHover.x = (this.game.camera.width / 2) - (player.scoreHover.width / 2);
    player.scoreHover.y = (this.game.camera.height / 2) - 90;
    Game.world.bringToTop(player.scoreHover);
    Game.world.moveDown(player.scoreHover);
    player.scoreHover.fixedToCamera = true;

    // if(player.prevHealth != player.health || player.prevAmmo != Client.ammo) {
    if(Game.prevBoost !== player.boost) {
        Game.playerHUD["boost"] = player.boost;

        changeFlag = true;
    }
    Game.prevBoost = player.boost;

    if(Game.prevBullets !== Client.ammo){
        Game.playerHUD["bullets"] = Client.ammo;

        changeFlag = true;
    }
    Game.prevBullets = Client.ammo;
    player.prevAmmo = Client.ammo;

    if(Game.prevDust !== player.score){
        Game.playerHUD["currency"] = player.score;
        changeFlag = true;
    }
    Game.prevDust = player.score;

    if(changeFlag) {
        player.shield.setText('Shield:\n' +
            'Bullets: ' + Game.playerHUD["bullets"] + '/' + Game.maxWeaponAmmo[Client.weaponId] + '\n' +
            'Boost: ' + Game.playerHUD["boost"] + '/' + Game.maxBoost + '\n' +
            'Dust: ' + Game.playerHUD["currency"]);
    }
    // }
    player.nameHover.fontSize = this.game.camera.width * .013;
    player.shield.fontSize = this.game.camera.width * .023;
    player.scoreHover.fontSize = this.game.camera.width * .013;

    player.centerPointer.bringToTop();
    player.centerPointer.x = player.x;
    player.centerPointer.y = player.y;
    player.centerPointer.rotation = game.physics.arcade.angleToXY(player, Game.safeZone.x, Game.safeZone.y);

    Game.updateHealthBar(player);
    if (Game.allPlayersAdded)
    {
        Game.updateLeaderboard();
    }
};
var healthTime = true;
Game.updateHealthBar = function(player) {
    if(healthTime && player !== undefined) {
        setTimeout(function () {
            player.heal(5);
            healthTime = true;
        }, 1000);
        healthTime = false;
    }
    //player.damage(.05);
    if(player.health === 0){
        //Game.playerKilled(player);
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
        player.healthBar.lineStyle(this.game.camera.width * .02, color, 1);
        player.healthBar.moveTo(0, 0);
        player.healthBar.lineTo((this.game.camera.width * .001) * xHealth, 0);
        player.healthBar.endFill();
    }
    else if (player.prevHealth !== player.health || player.healthBar.safe || Game.screenResized){
        player.healthBar.safe = false;
        player.healthBar.clear();
        var x = player.health / 100;
        var xHealth = (player.health / 100) * 100;
        var color = Game.rgbToHex((2.0 * x) * 255, (2.0 * (1 - x)) * 255, 0);
        //Game.healthBar.x = 10;
        //Game.healthBar.y = 10;
        player.healthBar.beginFill(color);
        player.healthBar.lineStyle(this.game.camera.width * .02, color, 1);
        player.healthBar.moveTo(0, 0);
        player.healthBar.lineTo((this.game.camera.width * .001) * xHealth, 0);
        player.healthBar.endFill();
        if(Game.screenResized)
            Game.screenResized = false;
        if(player.prevHealth > player.health) {
            shake();
        }
    }

    player.healthBar.x = player.shield.x + (this.game.camera.width * .10);
    player.healthBar.y = player.shield.y + (this.game.camera.width * .09 * .12);
    player.prevHealth = player.health;
    Game.world.bringToTop(player.healthBar);
    Game.world.moveDown(player.healthBar);
    player.healthBar.fixedToCamera = true;

    Game.world.bringToTop(shop.shopMenu);
    Game.world.bringToTop(shop.scrollBarBackground);
    Game.world.bringToTop(shop.scrollBar);
    Game.world.bringToTop(shop.tierBox);
    Game.world.bringToTop(shop.ammoBox);
    Game.world.bringToTop(shop.weaponBox1);
    Game.world.bringToTop(shop.weaponBox2);
    Game.world.bringToTop(shop.weaponBox3);
    Game.world.bringToTop(shop.boostBox);
    Game.world.bringToTop(shop.prevTierButton);
    Game.world.bringToTop(shop.nextTierButton);
    Game.world.bringToTop(shop.tierText);
    Game.world.bringToTop(shop.statText);
    Game.world.bringToTop(shop.ammoText);
    Game.world.bringToTop(shop.weapon1Text);
    Game.world.bringToTop(shop.weapon2Text);
    Game.world.bringToTop(shop.weapon3Text);
    Game.world.bringToTop(shop.boostText);
    Game.world.bringToTop(shop.weapon1Sprite);
    Game.world.bringToTop(shop.weapon2Sprite);
    Game.world.bringToTop(shop.weapon3Sprite);
    if (shop.Tiers[shop.visibleTier] !== undefined && shop.Tiers[shop.visibleTier].elements !== undefined) {
        shop.Tiers[shop.visibleTier].elements.forEach(function (element) {
            Game.world.bringToTop(element);
        });
    }
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
            // console.log('#1 = '+Game.playerMap[p].name);
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
                // console.log('#2 = ' + Game.playerMap[p].name);
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
                // console.log('#3 = ' + Game.playerMap[p].name);
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
                // console.log('#4 = ' + Game.playerMap[p].name);
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
    Game.playerMap[Client.id].scoreboard.x = (this.game.camera.width / 2) + ((this.game.camera.width / 2) - 20);
    Game.playerMap[Client.id].scoreboard.y = (this.game.camera.height / 2) - ((this.game.camera.height / 2) - 20);
    Game.world.bringToTop(Game.playerMap[Client.id].scoreboard);
    Game.world.moveDown(Game.playerMap[Client.id].scoreboard);
    Game.playerMap[Client.id].scoreboard.fixedToCamera = true;

    Game.world.bringToTop(shop.shopMenu);
    Game.world.bringToTop(shop.scrollBarBackground);
    Game.world.bringToTop(shop.scrollBar);
    Game.world.bringToTop(shop.tierBox);
    Game.world.bringToTop(shop.ammoBox);
    Game.world.bringToTop(shop.weaponBox1);
    Game.world.bringToTop(shop.weaponBox2);
    Game.world.bringToTop(shop.weaponBox3);
    Game.world.bringToTop(shop.boostBox);
    Game.world.bringToTop(shop.prevTierButton);
    Game.world.bringToTop(shop.nextTierButton);
    Game.world.bringToTop(shop.tierText);
    Game.world.bringToTop(shop.statText);
    Game.world.bringToTop(shop.ammoText);
    Game.world.bringToTop(shop.weapon1Text);
    Game.world.bringToTop(shop.weapon2Text);
    Game.world.bringToTop(shop.weapon3Text);
    Game.world.bringToTop(shop.boostText);
    Game.world.bringToTop(shop.weapon1Sprite);
    Game.world.bringToTop(shop.weapon2Sprite);
    Game.world.bringToTop(shop.weapon3Sprite);
    if (shop.Tiers[shop.visibleTier] !== undefined && shop.Tiers[shop.visibleTier].elements !== undefined) {
        shop.Tiers[shop.visibleTier].elements.forEach(function (element) {
            Game.world.bringToTop(element);
        });
    }

    Game.playerMap[Client.id].scoreboard.setText(
        '#1 '+ (Game.leaderboard[1] !== null ? Game.leaderboard[1].score+'-'+Game.leaderboard[1].name : '_______')+
        '\n#2 ' + (Game.leaderboard[2] !== null ? Game.leaderboard[2].score+'-'+Game.leaderboard[2].name : '_______')+
        '\n#3 ' + (Game.leaderboard[3] !== null ? Game.leaderboard[3].score+'-'+Game.leaderboard[3].name : '_______')+
        '\n#4 ' + (Game.leaderboard[4] !== null ? Game.leaderboard[4].score+'-'+Game.leaderboard[4].name : '_______')+
        '\n#5 ' + (Game.leaderboard[5] !== null ? Game.leaderboard[5].score+'-'+Game.leaderboard[5].name : '_______'));

    Game.playerMap[Client.id].scoreboard.fontSize = this.game.camera.width * .023;
};

Game.updateSize = function(id, size)
{
    Game.playerMap[id].width = size;
    Game.playerMap[id].height = size;
};

Game.setTrail = function(id, trailSet) {
    if (Game.allPlayersAdded) {
        var player = Game.playerMap[id];
        player.shipTrail.visible = trailSet;
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
    Game.playerMap[Client.id].centerPointer.visible = false;
    Game.playerMap[Client.id].safePromptHover.visible = true;
    Game.playerMap[Client.id].safePromptHover.setText(
        'Store [E]\n'
        + Game.calcAmmoRefillPrompt(true)
        + Game.calcBoostRefillPrompt(true));
       /* + 'Refill ammo: '+(Game.bulletReloadCostList[Client.weaponId]*Game.maxWeaponAmmo[Client.weaponId]
        * ((Game.maxWeaponAmmo[Client.weaponId]-Client.ammo)/Game.maxWeaponAmmo[Client.weaponId]))+'[R]\n'*/
        /*+ 'Refill 1 boost: '+Game.boostRefillCost+'[B]');*/
    Game.playerMap[Client.id].safePromptHover.x = (this.game.camera.width / 2);
    Game.playerMap[Client.id].safePromptHover.y = (this.game.camera.height / 2) + .1*this.game.camera.height;
    Game.playerMap[Client.id].safePromptHover.fontSize = this.game.camera.width * .013;
    Game.playerMap[Client.id].safePromptHover.fixedToCamera = true;
};

Game.calcAmmoRefillPrompt = function(hover)
{
    if (Client.ammo >= Game.maxWeaponAmmo[Client.weaponId])
    {
        if (hover)
            return 'Ammo full!\n';
        else
            return 'Ammo full!';
    }
    else if (Client.score <= 0)
    {
        if (hover)
            return 'No money for ammo!\n';
        else
            return 'No money for ammo!';
    }
    else if (Client.score >= Math.ceil(Game.bulletReloadCostList[Client.weaponId]*Game.maxWeaponAmmo[Client.weaponId]
            * ((Game.maxWeaponAmmo[Client.weaponId]-Client.ammo)/Game.maxWeaponAmmo[Client.weaponId])))
    {
        if (hover)
            return 'Refill all ammo: '+Math.ceil(Game.bulletReloadCostList[Client.weaponId]*Game.maxWeaponAmmo[Client.weaponId]
            * ((Game.maxWeaponAmmo[Client.weaponId]-Client.ammo)/Game.maxWeaponAmmo[Client.weaponId]))+' [R]\n';
        else
            return 'Refill all ammo: '+Math.ceil(Game.bulletReloadCostList[Client.weaponId]*Game.maxWeaponAmmo[Client.weaponId]
                * ((Game.maxWeaponAmmo[Client.weaponId]-Client.ammo)/Game.maxWeaponAmmo[Client.weaponId]));
    }
    else
    {
        if (hover)
            return 'Refill '+Math.ceil(Client.score/Game.bulletReloadCostList[Client.weaponId])+' ammo: '+Client.score+' [R]\n';
        return 'Refill '+Math.ceil(Client.score/Game.bulletReloadCostList[Client.weaponId])+' ammo: '+Client.score;
    }
};

Game.calcBoostRefillPrompt = function(hover)
{
    if (Game.playerMap[Client.id].boost >= Game.maxBoost)
    {
        if (hover)
            return 'Boost full!\n';
        else
            return 'Boost full!';
    }
    else if (Client.score <= 0)
    {
        return 'No money for boost!';
    }
    else if (Client.score >= Math.ceil(Game.boostRefillCost*Game.maxBoost
            * ((Game.maxBoost-Game.playerMap[Client.id].boost)/Game.maxBoost)))
    {
        if (hover)
            return 'Refill all boost: '+Math.ceil(Game.boostRefillCost*Game.maxBoost
            * ((Game.maxBoost-Game.playerMap[Client.id].boost)/Game.maxBoost))+' [B]\n';
        else
            return 'Refill all boost: '+Math.ceil(Game.boostRefillCost*Game.maxBoost
                * ((Game.maxBoost-Game.playerMap[Client.id].boost)/Game.maxBoost));
    }
    else
    {
        if (hover)
            return 'Refill '+Math.ceil(Client.score/Game.boostRefillCost)+' boost: '+Client.score+' [B]\n';
        else
            return 'Refill '+Math.ceil(Client.score/Game.boostRefillCost)+' boost: '+Client.score;
    }
};

Game.unshowBasePrompts = function(){
    Game.playerMap[Client.id].safePromptHover.visible = false;
    Game.playerMap[Client.id].centerPointer.visible = true;
};

Game.reloadWeapon = function(){
    if (Client.ammo >= Game.maxWeaponAmmo[Client.weaponId])
    {
        // Ammo already full
    }
    else if (Client.score <= 0)
    {
       // No money to reload
    }
    else if (Client.score >= Math.ceil(Game.bulletReloadCostList[Client.weaponId]*Game.maxWeaponAmmo[Client.weaponId]
            * ((Game.maxWeaponAmmo[Client.weaponId]-Client.ammo)/Game.maxWeaponAmmo[Client.weaponId])))
    {
        Client.sendCollect(-Math.ceil(Game.bulletReloadCostList[Client.weaponId]*Game.maxWeaponAmmo[Client.weaponId]
            * ((Game.maxWeaponAmmo[Client.weaponId]-Client.ammo)/Game.maxWeaponAmmo[Client.weaponId])));
        Client.ammo = Game.maxWeaponAmmo[Client.weaponId];

        Client.refillAmmo(Client.ammo);
    }
    else
    {
        Client.ammo += Math.ceil(Client.score/Game.bulletReloadCostList[Client.weaponId]);
        if (Client.ammo > Game.maxWeaponAmmo[Client.weaponId])
        {
            Client.ammo = Game.maxWeaponAmmo[Client.weaponId];
        }
        Client.sendCollect(-Client.score);
        Client.refillAmmo(Client.ammo);
    }

    /*if (Game.playerMap[Client.id].score >= (Game.bulletReloadCostList[Client.weaponId]*Game.maxWeaponAmmo[Client.weaponId]
            * ((Game.maxWeaponAmmo[Client.weaponId]-Client.ammo)/Game.maxWeaponAmmo[Client.weaponId]))
            && Client.ammo < Game.maxWeaponAmmo[Client.weaponId])
    {
        Client.sendCollect(-(Game.bulletReloadCostList[Client.weaponId]*Game.maxWeaponAmmo[Client.weaponId]
            * ((Game.maxWeaponAmmo[Client.weaponId]-Client.ammo)/Game.maxWeaponAmmo[Client.weaponId])));
        Client.ammo += Game.maxWeaponAmmo[Client.weaponId];
        if (Client.ammo > Game.maxWeaponAmmo[Client.weaponId])
        {
            Client.ammo = Game.maxWeaponAmmo[Client.weaponId];
        }
        Client.refillAmmo(Client.ammo);
    }*/
};

Game.refillBoost = function(){
    if (Client.boost >= Game.playerMap[Client.id].boost)
    {
        // Boost already full
    }
    else if (Client.score <= 0)
    {
       // No money to reload
    }
    else if (Client.score >= (Game.boostRefillCost*Game.maxBoost
            * ((Game.maxBoost-Game.playerMap[Client.id].boost)/Game.maxBoost)))
    {
        Client.sendCollect(-Math.ceil(Game.boostRefillCost*Game.maxBoost
            * ((Game.maxBoost-Game.playerMap[Client.id].boost)/Game.maxBoost)));
        Game.playerMap[Client.id].boost = Game.maxBoost;
    }
    else
    {
        Game.playerMap[Client.id].boost += Math.ceil(Client.score/Game.boostRefillCost);
        if (Game.playerMap[Client.id].boost > Game.maxBoost)
        {
            Game.playerMap[Client.id].boost = Game.maxBoost;
        }
        Client.sendCollect(-Client.score);
    }

    /*if (Game.playerMap[Client.id].score >= Game.boostRefillCost && Game.playerMap[Client.id].boost < Game.maxBoost)
    {
        Client.sendCollect(-Game.boostRefillCost);
        Game.playerMap[Client.id].boost++;
        if (Game.playerMap[Client.id].boost > Game.maxBoost)
        {
            Game.playerMap[Client.id].boost = Game.maxBoost;
        }
    }*/
};

// Update the ship of another player
Game.updatePlayerShip = function(id, shipName){
    if (Game.allPlayersAdded){
        //console.log('we got to update playership, the player id is: '+ id + " " + shipName);
        Game.playerMap[id].loadTexture(shipName); // loadTexture draws the new sprite
    }
};

Game.removePlayer = function(id){
    // console.log('Game.removePlayer '+id+'--'+Game.playerMap[id].name);
    Game.removeFromLeaderboard(id);
    Game.ammoMap[id].removeAll(true);

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
    /*Game.removeFromLeaderboard(thePlayer.id);
    Game.playerMap[thePlayer.id].shipTrail.destroy();
    generateDustOnDeath(Game.playerMap[thePlayer.id].x, Game.playerMap[thePlayer.id].y, Game.playerMap[thePlayer.id].score);
    burst(Game.playerMap[thePlayer.id].x, Game.playerMap[thePlayer.id].y);
    playerMap.delete(thePlayer.id);
    thePlayer.destroy();
    Game.playerDestroyed = true;
    delete thePlayer;*/
};

Game.getCoordinates = function(layer, pointer) {
    Client.sendClick(pointer.worldX, pointer.worldY);
};

Game.setPlayerAcceleration = function(acceleration, isBoost){
    if (Game.allPlayersAdded && Game.playerMap[Client.id] !== undefined && Game.playerMap[Client.getPlayerID()].body !== undefined && Game.playerMap[Client.getPlayerID()].health > 0) {
        if (isBoost && Game.playerMap[Client.id].boost >= Game.boostCost) {
            Game.playerMap[Client.id].isBoosting = true;
            if (Game.playerMap[Client.id] !== undefined) {
                Game.playerMap[Client.id].shipTrail.setScale(0.5, 0.8, 0.5, 0.8, 1000, Phaser.Easing.Quintic.Out);
            }

            Game.playerMap[Client.id].body.maxVelocity.set(Game.maxBoostVelocity);
            // Game.playBoostPFX();

            // console.log('we boostin');
            Game.playerMap[Client.id].boost -= Game.boostCost;
            // game.physics.arcade.velocityFromRotation(rotation, weaponArray[weaponId].velocity, bullet.body.velocity);
            game.physics.arcade.accelerationFromRotation(Game.playerMap[Client.id].rotation,
                acceleration * Game.boostAccelMult, Game.playerMap[Client.id].body.acceleration);

            //game.physics.arcade.accelerationFromRotation(Game.playerMap[Client.id].rotation,
            //    acceleration, parallax);
        }
        else {
            Game.playerMap[Client.id].isBoosting = false;

            if (Game.playerMap[Client.id] !== undefined) {
                Game.playerMap[Client.id].shipTrail.setScale(0.05, 0.4, 0.05, 0.4, 2000, Phaser.Easing.Quintic.Out);
            }

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

Game.addNewPlayer = function(id,x,y,rotation,shipName,name,score,color,size){
    console.log('Game.addNewPlayer '+id+'--'+name+'--'+shipName);

    Game.shipTrails[id] = game.add.emitter(x, y + size/2, 10);

    var newPlayer;
    // Create player sprite and assign the player a unique ship
    // If it is a new player
    if(shipName === 'unassignedShip'){//} && id === Client.id/*Client.getPlayerID()*/){
        var shipSelectionString = assignShip(id + 1);
        newPlayer = game.add.sprite(x,y,shipSelectionString);

        if (id === Client.id) {
            Client.sendShipChange(shipSelectionString);

            newPlayer.centerPointer = game.add.sprite(x,y,'arrow');
            newPlayer.centerPointer.startWidth = newPlayer.centerPointer.width;
            var cpW = newPlayer.centerPointer.width;
            var cpH = newPlayer.centerPointer.height;
            newPlayer.centerPointer.width = game.width*0.2083;
            newPlayer.centerPointer.height = newPlayer.centerPointer.width*(cpH/cpW);
            // newPlayer.addChild(newPlayer.centerPointer);
            // newPlayer.centerPointer.scale.setTo(4);
            newPlayer.centerPointer.anchor.setTo(0.3,0.5);
            newPlayer.centerPointer.alpha = 0.75;
        }
    }
    // If it is an existing player
    else {
        // console.log(name+'\'s shipName: '+shipName);
        newPlayer = game.add.sprite(x, y, shipName);
        // console.log('else statement - shipSelectionString: ' + shipName);
    }

    // Adjust player's squared size
    newPlayer.width = size;
    newPlayer.height = size;

    // Set player sprite origin to center
    newPlayer.anchor.set(0.5);
    // Set starting rotation of player instance
    newPlayer.rotation = rotation;

    newPlayer.name = name;

    // Enable appropriate player physics
    Game.physics.enable(newPlayer, Phaser.Physics.ARCADE);
    newPlayer.enableBody = true;                            //Here is what is needed for
    newPlayer.body.collideWorldBounds = true;
    newPlayer.body.drag.set(100);
    newPlayer.body.maxVelocity.set(Game.maxNormVelocity);

    //  Add an emitter for the ship's trail
    newPlayer.shipTrail = Game.shipTrails[id];
    newPlayer.shipTrail.gravity = 0;
    // newPlayer.shipTrail.z = -1000;
    newPlayer.shipTrail.width = 10;
    newPlayer.shipTrail.makeParticles('trail');
    newPlayer.shipTrail.setXSpeed(30, -30);
    newPlayer.shipTrail.setYSpeed(30, -30);
    newPlayer.shipTrail.setAlpha(1, 0.01, 800);
    newPlayer.shipTrail.setScale(0.05, 0.4, 0.05, 0.4, 2000, Phaser.Easing.Quintic.Out);
    newPlayer.shipTrail.start(false, 150, 10);
    newPlayer.shipTrail.isBoosting = false;

    // Set player sprite and trail color
    newPlayer.tint = color;
    newPlayer.shipTrail.setAll('tint', color);
    //newPlayer.maxHealth = 200;

    // Initialize player's health
    newPlayer.heal(100);


    /* newPlayer.shield.setText('Shield:\n' +
         'Bullets: ' + playerHUD["bullets"] + '\n' +
         'Boost: ' + playerHUD["boost"] + '\n' +
         'Currency: ' + playerHUD["currency"], { font: '100px Arial', fill: '#fff' }); */

    // Set the player's score
    // Game.playerHUD["currency"] = score;
    newPlayer.boost = Game.maxBoost;
    newPlayer.isBoosting = false;
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
    Game.playerMap[id].shield = Game.add.text(0, 0, '', {font: 'Lucida Console', fontSize: this.game.camera.width * .01, fill: '#fff' });
    Game.playerMap[id].nameHover = Game.add.text(0, 0, '', {font: 'Lucida Console', fontSize: this.game.camera.width * .01, fill: '#fff'});
    Game.playerMap[id].safePromptHover = Game.add.text(0, 0, '', {font: 'Lucida Console', fontSize: this.game.camera.width * .01, fill: '#fff', boundsAlignH: "center"});
    Game.playerMap[id].safePromptHover.anchor.set(0.5,0.5);
    Game.playerMap[id].scoreHover = Game.add.text(0, 0, '', {font: 'Lucida Console', fontSize: this.game.camera.width * .01, fill: '#fff'});
    Game.playerMap[id].healthBar = Game.add.graphics(0,0);
    Game.playerMap[id].healthBar.safe = false;
    Game.playerMap[id].prevHealth = -1;
    Game.playerMap[id].scoreboard = Game.add.text(0, 0, '', {font: 'Lucida Console', fontSize: this.game.camera.width * .01, fill: '#fff'/*, boundsAlignH: 'right'*/ });
    Game.playerMap[id].scoreboard.anchor.setTo(1, 0);

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
        Game.playerMap[id].shipTrail.destroy();
        burst(Game.playerMap[id].x, Game.playerMap[id].y);
        Game.removeFromLeaderboard(id);
        Client.disconnect();
        setTimeout(
            function(){

                Client.setClientScores(Game.playerMap[id].score);

        // generateDustOnDeath(Game.playerMap[id].x, Game.playerMap[id].y, Game.playerMap[id].score);
                playerMap.delete(id);
                var player = Game.playerMap[id];
                player.destroy();
                Game.playerDestroyed = true;
                delete player;

                shop.Tiers.forEach(function(tier) {
                    tier.elements = [];
                });
                shop.Tiers = [];

                console.log('Switching to menu state');


                game.state.start('Menu');
                game.state.clearCurrentState();
            }, 3000);
    });
};



Game.setAllPlayersAdded = function(){
    Game.allPlayersAdded = true;
};

//This function creates a string name of the ship to be assigned to a new player
//T1 ship
function assignShip(amountOfPlayers) {
    //var shipNumber = amountOfPlayers % numberOfShipSprites;
    //Changed logic to provide one of the first three ships to new players
    var randomShip = randomInt(1,4); //range of 1 - 3
    if(randomShip == 3){
        randomShip = 7;
    }
    return 'ship' + randomShip;
}

Game.rescale = function(){
    console.log('Rescaling game to '+window.innerWidth+'x'+window.innerHeight);
    this.game.scale.setGameSize(window.innerWidth, window.innerHeight);

    Game.background.canvas = PIXI.CanvasPool.create(this, game.width, game.height);
    Game.background.context = Game.background.canvas.getContext('2d');
    Game.background.setTexture(new PIXI.Texture(new PIXI.BaseTexture(Game.background.canvas)));
    Game.layer.canvas = PIXI.CanvasPool.create(this, game.width, game.height);
    Game.layer.context =  Game.layer.canvas.getContext('2d');
    Game.layer.setTexture(new PIXI.Texture(new PIXI.BaseTexture(Game.layer.canvas)));

    /*Game.safeZone.sendToBack();
    Game.layer.sendToBack();
    Game.background.sendToBack();*/

    /*Game.background = Game.map.createLayer('Backgroundlayer');

    // safeZoneLayer = map.createLayer('Zonelayer');
    Game.safeZone = game.add.sprite(3235,3240,'safe_zone');
    Game.safeZone.width = 1205;
    Game.safeZone.height = 1205;
    Game.safeZone.anchor.setTo(0.5,0.5);
    Game.safeZone.alpha = 0.6;
    Game.layer = Game.map.createLayer('Groundlayer');
    Game.map.setCollisionBetween(0, 4000, true, 'Groundlayer');
    Game.layer.resizeWorld();*/

    if (Game.allPlayersAdded)
    {
        // Game.background = map.createLayer('Backgroundlayer');
        // Game.layer.resizeWorld();

        var cpW = Game.playerMap[Client.id].centerPointer.width;
        var cpH = Game.playerMap[Client.id].centerPointer.height;
        Game.playerMap[Client.id].centerPointer.width = game.width*0.2083;
        Game.playerMap[Client.id].centerPointer.height = Game.playerMap[Client.id].centerPointer.width*(cpH/cpW);

        // console.log('ratio = '+game.width/game.height+' -- resize to '+Game.playerMap[Client.id].centerPointer.width)
        if (Game.playerMap[Client.id].centerPointer.width > Game.playerMap[Client.id].centerPointer.startWidth)
        {
            Game.playerMap[Client.id].centerPointer.width = Game.playerMap[Client.id].centerPointer.startWidth;
        }
        else if (Game.playerMap[Client.id].centerPointer.width < 2*Game.playerMap[Client.id].width)
        {
            Game.playerMap[Client.id].centerPointer.width = 2*Game.playerMap[Client.id].width
        }
    }

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
// this is->   burst  lifetime    amout of particle

//called on bullet removal
function burstLittle(x,y){
    //generating burst
    burstLittleEmitter.x = x;
    burstLittleEmitter.y = y;
    burstLittleEmitter.start(true, 500, null, 2);
}
//called on player death
function burst(x,y){
  //bullet burst
    burstBig.x = x;
    burstBig.y = y;
    burstBig.start(true, 3000, null, 25);

}
function shake(){
  //Set shake intensity and duration
    game.camera.shake(0.01, 100);
}


