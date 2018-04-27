var game = new Phaser.Game(window.innerWidth*window.devicePixelRatio,window.innerHeight*window.devicePixelRatio, Phaser.CANVAS, document.getElementById('game'));

Phaser.Device.whenReady(function () {
    game.plugins.add(PhaserInput.Plugin);
    // game.plugins.add(PhaserNineSlice.Plugin);
});

// game.state.add('Boot',Boot);
// game.state.add('Load',Load);
game.state.add('Menu',Menu);
game.state.add('Game',Game);

// game.state.start('Game');
game.state.start('Menu');


