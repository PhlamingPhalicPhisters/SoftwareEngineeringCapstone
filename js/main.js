var game = new Phaser.Game(window.innerWidth*window.devicePixelRatio,window.innerHeight*window.devicePixelRatio, Phaser.CANVAS, document.getElementById('game'));
game.state.add('Game',Game);
game.state.start('Game');