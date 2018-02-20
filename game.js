Game = function(game) {}
Game.prototype = {
    preload: function() {
        // load assets
        this.game.load.image('sprite', 'assets/sprites/sprite.png');
        this.game.load.image('background', 'assets/map/tilesheet.png');
    },
    create: function() {
        var width = this.game.width;
        var height = this.game.height;

        this.game.world.setBounds(-width, -height, width*2, height*2);
        this.game.stage.backgroundColor = '#444';
    }
}