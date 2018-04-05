var Client = {};
Client.socket = io.connect();
Client.player;
Client.id = -1;

Client.askNewPlayer = function(){
    Client.socket.emit('newplayer');
};

Client.getPlayerID = function(){
    return Client.id;
};

Client.getPlayer = function(){
    Client.socket.emit('getplayer');
};

Client.socket.on('setplayer',function(data){
    Client.player = data;
});

Client.socket.on('newplayer',function(data){
    //console.log('id: ');
    if (Client.id == -1) {
        Client.id = data.id;
        console.log('Client.id: ' + data.id);
    }
    Game.addNewPlayer(data.id,data.x,data.y,data.rotation);
});

Client.socket.on('allplayers',function(data){
    console.log('new player joined');
    //console.log(data);
    for(var i = 0; i < data.length; i++){
        if (data[i].id != Client.id) {
            Game.addNewPlayer(data[i].id, data[i].x, data[i].y, data[i].rotation);
        }
    }
    Game.setAllPlayersAdded();
});

Client.socket.on('remove',function(id){
    Game.removePlayer(id);
});

Client.sendClick = function(x, y) {
    Client.socket.emit('click', {x: x, y: y});
};

Client.socket.on('move', function(data) {
    Game.movePlayer(data.id, data.x, data.y);
});

Client.sendTransform = function(x, y, rotation) {
    //console.log('Client sendTransform');
    //console.log(x+','+y+','+rotation);
    Client.socket.emit('transform', {x: x, y: y, rotation: rotation});
};

Client.socket.on('updateTransform', function(data) {
    //console.log('Client updateTransform');
    Game.updateTransform(data.id, data.x, data.y, data.rotation);
});

Client.sendAcceleration = function(direction) {
    Client.socket.emit('accelerate', {direction: direction});
};

Client.socket.on('updateAcceleration', function(data, direction) {
    Game.setPlayerAcceleration(data.id, direction);
});

Client.sendRotation = function(angularVelocity) {
    Client.socket.emit('rotate', {angularVelocity: angularVelocity});
};

Client.socket.on('updateRotation', function(data, angularVelocity) {
    Game.setPlayerRotation(data.id, angularVelocity);
});

/*Client.sendShoot = function() {
    Client.socket.emit('shoot');
};

Client.socket.on('fire', function(data) {
    Game.playerShoot(data.id);
});*/

Client.sendFire = function(x, y, width, height, rotation) {
    //var bullet = bulletInfo.bullet;
    //var bullets = bulletInfo.bullets

    Client.socket.emit('fire', {x: x, y: y, width: width, height: height, rotation: rotation, id: Client.id});
};

Client.requestTime = function() {
    Client.socket.emit('requestTime');
};

Client.socket.on('sendTime', function(data) {
    //Game.getServerTime(data.time);
    //Game.setStartTime(data.time);
    Game.serverStartTime = data.time;
    game.time.now = 0;
});

Client.socket.on('startTime', function(data) {
    Game.setStartTime(data.time);
});

Client.socket.on('updateFire', function(data) {
    Game.updateBullets(data.x, data.y, data.width, data.height, data.rotation, data.id, data.time);

    //Game.updateBullets(data);
});

