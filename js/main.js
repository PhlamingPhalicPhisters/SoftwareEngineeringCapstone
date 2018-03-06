var game = new Phaser.Game(window.width,window.height, Phaser.CANVAS, document.getElementById('game'));
game.state.add('Game',Game);
game.state.start('Game');