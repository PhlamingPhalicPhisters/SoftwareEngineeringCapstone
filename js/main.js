var game = new Phaser.Game(24*64, 17*64, Phaser.AUTO, document.getElementById('game'));
game.state.add('Game',Game);
game.state.start('Game');