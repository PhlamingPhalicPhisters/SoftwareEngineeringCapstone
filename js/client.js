var Client = {};
Client.socket = io.connect();
// Client.socket;
Client.player;
Client.name='';
Client.id = -1;
Client.weaponId = -1;
Client.ammo = 0;
Client.score = 0;
Client.highScore = 0;
Client.lastScore = 0;

// Client.connect = function(){
//     console.log('Client.connect()--Client.name = '+Client.name);
//     Client.socket = io.connect();
//     Client.socket.emit('setname',{name: Client.name});
// };

Client.disconnect = function () {
    Client.socket.disconnect();
};

Client.connect = function() {

    Client.socket = Client.socket.close();
    Client.socket = Client.socket.open();
// Client.socket;
    Client.player;
    //Client.name='';
    Client.id = -1;
    Client.weaponId = -1;
    Client.ammo = 0;
    Client.score = 0;
};

Client.setClientName = function(name){

    Client.name = name;
    console.log('Client.name--'+Client.name);
};

Client.sendPlayerName = function()
{
    console.log('Client.setPlayerInfo');
    Client.socket.emit('setname',{name: Client.name});
};

Client.socket.on('updatename',function(data){
    // console.log(data.id+'--'+data.name);
    Game.updateName(data.id, data.name);
});

Client.getPlayerID = function(){
    return Client.id;
};

Client.getPlayer = function(){
    Client.socket.emit('getplayer');
};

Client.socket.on('setplayer',function(data){
    Client.player = data;
});

Client.askNewPlayer = function(){
    Client.socket.emit('newplayer',{name: Client.name});
};

Client.socket.on('newplayer',function(data){
    //console.log('id: ');
    if (game.state.current === 'Game') {
        if (Client.id === -1) {
            Client.id = data.id;
            Client.name = data.name;
            console.log('Client.id: ' + data.id + '--' + data.name);
        }

        if (Client.weaponId === -1) {
            Client.weaponId = data.weaponId;
            console.log('Client.weaponId: ' + data.weaponId);
            if (Client.weaponId === 0) {
                Client.ammo = 250;
            }
            if (Client.weaponId === 1) {
                Client.ammo = 500;
            }
            if (Client.weaponId === 2) {
                Client.ammo = 100;
            }
            Client.socket.emit('setAmmo', {id: Client.id, ammo: Client.ammo, weaponId: Client.weaponId});
        }
        //Game.addNewPlayer(data.id,data.x,data.y,data.rotation);
        // console.log('asscream');
        console.log(data.health);
        Game.addNewPlayer(data.id, data.x, data.y, data.rotation, data.shipName, data.name, data.score);
        if (data.id === Client.id)
            Game.setDeathBehavior(data.id);
    }
});

Client.socket.on('allplayers',function(data){
    console.log('new player joined');
    //console.log(data);
    for(var i = 0; i < data.length; i++){
        if (data[i].id !== Client.id) {
            console.log("Ship Name of an existing ship being sent to new player" + data[i].shipName);

            Game.updateAmmo(data[i].id, data[i].ammo, data[i].weaponId);
            Game.addNewPlayer(data[i].id, data[i].x, data[i].y, data[i].rotation, data[i].shipName, data[i].name, data[i].score);
        }
    }
    Game.setAllPlayersAdded();
});

Client.setClientScores = function(score) {
    Client.lastScore = score;
    if (score > Client.highScore)
    {
        Client.highScore = score;
    }
};

Client.socket.on('remove',function(id){
    if (game.state.current === 'Game') {
        Game.removePlayer(id);
    }
});

Client.sendClick = function(x, y) {
    Client.socket.emit('click', {x: x, y: y});
};

Client.socket.on('move', function(data) {
    Game.movePlayer(data.id, data.x, data.y);
});

Client.sendTransform = function(x, y, rotation, health) {
    //console.log('Client sendTransform');
    //console.log(x+','+y+','+rotation);
    Client.socket.emit('transform', {x: x, y: y, rotation: rotation, health: health});
};

Client.socket.on('updateTransform', function(data) {
    //console.log('Client updateTransform');
    Game.updateTransform(data.id, data.x, data.y, data.rotation, data.health);
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

Client.sendFire = function(x, y, rotation, weaponId, id) {
    //var bullet = bulletInfo.bullet;
    //var bullets = bulletInfo.bullets

    Client.socket.emit('fire', {x: x, y: y, rotation: rotation, weaponId: weaponId, id: id});
};

//Send the ship change to the server
Client.sendShipChange = function(shipName) {
    console.log("sending the ship change: " + shipName);
    Client.socket.emit('shipChange',{shipName: shipName});
};

//Update the ship of another player
Client.socket.on('updateShip', function (data) {
    console.log("Client recieved notice of update ship, name is: " + data.shipName);
    Game.updatePlayerShip(data.id, data.shipName);
});

Client.socket.on('updateFire', function(data) {
    if (game.state.current === 'Game') {
        Game.updateBullets(data.x, data.y, data.rotation, data.weaponId, data.id);
    }

    //Game.updateBullets(data);
});

Client.socket.on('updateAmmo', function(data) {
    Game.updateAmmo(data.id, data.ammo, data.weaponId);
});

Client.changeAmmo = function(ammo) {
    Client.socket.emit('changeAmmo', ammo);
};

Client.sendCollect = function(value) {
    Client.score += value;
    Client.socket.emit('collect', {id: Client.id, value: value});
};

Client.socket.on('updateScore',function(data)
{
    if (game.state.current === 'Game') {
        Game.updateScore(data.id, data.score);
    }
});

Client.askUpdate = function() {
    Client.socket.emit('askUpdate');
};

Client.socket.on('returnTransform', function(data) {
    Game.updateTransform(data.id, data.x, data.y, data.rotation);
});

Client.setFocus = function(focused) {
    Client.socket.emit('setFocus', focused);
};

Client.socket.on('askCoordinates', function(data) {
    Client.socket.emit('returnCoordinates', {x: Game.playerMap[data.id].x, y: Game.playerMap[data.id].y, rotation: Game.playerMap[data.id].rotation, id: data.socketID, health: Game.playerMap[data.id].health});
});

Client.socket.on('updateCoordinates', function(data) {
    Game.updateTransform(Client.id, data.x, data.y, data.rotation, data.health);
});
