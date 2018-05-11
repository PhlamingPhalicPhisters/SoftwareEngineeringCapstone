var Menu = {};

Menu.menuConfig = {
    startY: 260,
        startX: 30
};

Menu.init = function()
{
    console.log('Menu.init');

    if (localStorage.highScore === undefined)
    {
        localStorage.highScore = 0;
    }
    if (localStorage.lastScore === undefined)
    {
        localStorage.lastScore = 0;
    }

    this.game.stage.disableVisibilityChange = true;

    Menu.maxNameLength = 13;   // Max length of the input player name
};

Menu.preload = function()
{
    console.log('Menu.preload');

    this.game.load.image('andromedaio_1','assets/splash/andromedaio_1.png');
    this.game.load.image('andromedaio_2','assets/splash/andromedaio_2.png');
    this.game.load.image('andromedaio_3','assets/splash/andromedaio_3.png');
    this.game.load.image('andromedaio_4','assets/splash/andromedaio_4.png');
    this.game.load.image('andromedaio_5','assets/splash/andromedaio_5.png');

    if (!this.cache.checkKey(Phaser.Cache.IMAGE, 'shipload')) {
        //console.log('loading');
        this.game.load.image('shipload', 'assets/sprites/ship1.png');
    }
    //this.game.load.spritesheet('loadingSprite','/assets/sprites/39/images/sprites.gif', 64,64,20);

    this.game.load.image('background','assets/map/dark-space.png');

    this.game.load.spritesheet('button', 'assets/splash/andromeda_button_sprite_sheet_scaled.png', 189, 66);
    // this.game.load.spritesheet('button', 'assets/splash/andromeda_button_sprite_sheet.png', 189, 66);
    // this.game.load.spritesheet('button', 'assets/splash/button_sprite_sheet.png', 193, 71);
};

Menu.create = function()
{
    console.log('Menu.create');

    // Set up scaling management
    // this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    this.game.scale.pageAlignHorizontally = true;
    this.game.scale.pageAlignVertically = true;

    // Handle window resizing events every 50ms
    window.addEventListener('resize',function(event){
        clearTimeout(window.resizedFinished);
        window.resizedFinished = setTimeout(function(){
            console.log('Resize finished');
            Menu.rescale();
        }, 50);
    });

    Menu.background = null;
    Menu.titleImg = null;
    Menu.nameInput = null;
    Menu.button = null;
    Menu.highScore = null;
    Menu.lastScore = null;
    Menu.addGraphics();

    onColorUpdate(Menu.titleImg);

    // Menu.button.onInputOver.add(over, this);
    // Menu.button.onInputOut.add(out, this);
    // Menu.button.onInputUp.add(up, this);

    /*if (music.name !== "dangerous" && playMusic) {

            music.stop();

            music = game.add.audio('dangerous');

            music.loop = true;

            music.play();

    }*/


    // Menu.addMenuOption('Start', function () {
    //     game.state.start("Game");
    // });
    //
    // Menu.addMenuOption('Options', function () {
    //     game.state.start("Options");
    // });
    //
    // Menu.addMenuOption('Credits', function () {
    //     game.state.start("Credits");
    // });
};

Menu.update = function()
{
    if (game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR))
    {
        console.log(Menu.nameInput.value);
    }
    if (game.input.keyboard.isDown(Phaser.Keyboard.ENTER))
    {
        Menu.enterGame();
    }
};

Menu.enterGame = function()
{
    console.log('Switching to game state...');
    // console.log(Menu.nameInput.value);
    Client.setClientName(Menu.nameInput.value);
    game.state.start('Game');
};

Menu.addGraphics = function()
{
    Menu.background = this.game.add.tileSprite(this.game.world.bounds.left,this.game.world.bounds.top,
        this.game.world.bounds.right, this.game.world.bounds.bottom,'background');
    this.game.stage.backgroundColor = '#ffffff';

    Menu.titleImg = game.add.sprite(window.innerWidth/2,0.2*window.innerHeight,'andromedaio_4');
    Menu.titleImg.anchor.set(0.5);
    var imgWidth = Menu.titleImg.width;
    var imgHeight = Menu.titleImg.height;
    Menu.titleImg.width = window.innerWidth*0.6;
    Menu.titleImg.height = Menu.titleImg.width * (imgHeight/imgWidth);

    if (typeof(Storage) !== "undefined") {
        // Code for localStorage/sessionStorage
        Menu.highScore = game.add.text(window.innerWidth/2, window.innerHeight/2-window.innerHeight*0.125, 'High Score: '+localStorage.highScore, { font: '35px Lucida Console', fill: '#ff0' });
        Menu.lastScore = game.add.text(window.innerWidth/2, window.innerHeight/2-window.innerHeight*0.05, 'Last Score: '+localStorage.lastScore, { font: '35px Lucida Console', fill: '#fff' });
    } else {
        // Sorry! No Web Storage support..
        Menu.highScore = game.add.text(window.innerWidth/2, window.innerHeight/2-125, 'High Score: '+Client.highScore, { font: '35px Arial', fill: '#fff' });
        Menu.lastScore = game.add.text(window.innerWidth/2, window.innerHeight/2-50, 'Last Score: '+Client.lastScore, { font: '35px Arial', fill: '#fff' });
    }
    Menu.highScore.anchor.set(0.5);
    Menu.lastScore.anchor.set(0.5);
    var scoreW = Menu.highScore.width;
    var scoreH = Menu.highScore.height;
    Menu.highScore.width = window.innerWidth*0.2;
    Menu.highScore.height = Menu.highScore.width * (scoreH/scoreW);
    Menu.lastScore.width = window.innerWidth*0.2;
    Menu.lastScore.height = Menu.lastScore.width * (scoreH/scoreW);

    var tempName;
    if (Menu.nameInput !== null)
    {
        tempName = Menu.nameInput.value;
    }
    var inputWidth = window.innerWidth*0.25+8+window.innerHeight*.005+1;
    Menu.nameInput = game.add.inputField(window.innerWidth/2-inputWidth/1.9, window.innerHeight/2/*+window.innerHeight*0.05*/, {
        font: '30px Arial',
        fill: '#'+Math.floor(Math.random()*(16777215/2.5)).toString(16),  // random text color
        fontWeight: 'bold',
        max: Menu.maxNameLength,
        width: inputWidth,
        padding: 8+window.innerHeight*.005,
        borderWidth: 5,
        borderColor: '#'+Math.floor(Math.random()*(16777215/1.5)).toString(16),
        borderRadius: 12,
        placeHolder: 'Enter username',
        placeHolderColor: '#989896',
        type: PhaserInput.InputType.text
    });
    Menu.nameInput.setText(tempName);
    Menu.nameInput.focusOutOnEnter = true;
    Menu.nameInput.startFocus();
    // Menu.nameInput.anchor.set(0.5);

    Menu.button = game.add.button(window.innerWidth/2,Menu.nameInput.y+Menu.nameInput.height/2+window.innerHeight*.2,
        'button', Menu.enterGame, this, 2, 1, 0);
    Menu.button.anchor.set(0.5);
    var buttonWidth = Menu.button.width;
    var buttonHeight = Menu.button.height;
    Menu.button.width = Menu.nameInput.width*.5;
    Menu.button.height = Menu.button.width * (buttonHeight/buttonWidth);
    randomTint(Menu.button);
};

Menu.rescale = function(){
    // console.log('Rescaling game to '+window.innerWidth+'x'+window.innerHeight);
    this.game.scale.setGameSize(window.innerWidth, window.innerHeight);

    Menu.addGraphics();

    onColorUpdate(Menu.titleImg);
};

var randomTint = function(sprite) {
    sprite.tint = Math.random() * 0xffffff;
};

var onColorUpdate = function(sprite) {
    if (sprite !== null)
    {
        randomTint(sprite);
    }
    var ms = 1500;
    sprite.updateEvent  = this.game.time.events.add(ms, function(){ onColorUpdate(sprite); }, this);
};