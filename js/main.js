var game = new Phaser.Game(window.innerWidth,window.innerHeight, Phaser.CANVAS, document.getElementById('game'));
game.state.add('Game',Game);
game.state.start('Game');