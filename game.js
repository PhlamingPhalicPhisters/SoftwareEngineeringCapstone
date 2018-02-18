Game = function(game) {}
Game.prototype = {
    preload: function() {
        // load assets
        this.game.load.image('circle', 'asset/circle.png');
        this.game.load.image('background', 'asset/tile.png');
    },
    create: function() {
        var width = this.game.width;
        var height = this.game.height;

        this.game.world.setBounds(-width, -height, width*2, height*2);
        this.game.stage.backgroundColor = '#444';
    }
}