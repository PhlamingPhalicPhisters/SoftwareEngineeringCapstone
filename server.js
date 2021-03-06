var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io').listen(server);


app.use('/css',express.static(__dirname + '/css'));
app.use('/js',express.static(__dirname + '/js'));
app.use('/assets',express.static(__dirname + '/assets'));

app.get('/',function(req,res){
    res.sendFile(__dirname+'/index.html');
});

server.lastPlayerId = 0;
server.modify = false;
server.listen(process.env.PORT || 8081,function(){
    console.log('Listening on '+server.address().port);
});

io.on('connection',function(socket){

    /*socket.on('disconnect', function() {
        console.log('disconnected');
    });*/

    socket.on('newplayer',function(data){
        socket.player = {
            id: server.lastPlayerId++,//incrementID(),
            name: checkNameSafety(server.lastPlayerId, data.name)/*data.name !== '' ? data.name : 'Player'+server.lastPlayerId*/,
            x: randomInt(2700, 3400),
            y: randomInt(2700, 3600),
            rotation: (-90) * (3.14 / 180), // start upward -- convert degrees to radians??
            health: 100,
            score: 0,
            weaponId: 0,
            ammo: 0,
            shipName: 'unassignedShip',
            color: randomTint(),
            size: 64,
            focused: true
        };

        console.log('Player '+socket.player.id+' ('+socket.player.name+') connected');
        socket./*broadcast.*/emit('newplayer',socket.player);
        socket.broadcast.emit('newplayer',socket.player);
        socket.emit('allplayers',getAllPlayers());


        socket.on('getplayer',function(data){
            socket.emit('setplayer',socket.player);
        });

        socket.on('setname',function(data){
            socket.player.name = data.name;
            console.log('socket.player.name: '+socket.player.name);
            // socket.emit('updatename',socket.player);
            // socket.broadcast.emit('updatename',socket.player);
        });

        socket.on('click',function(data){
            console.log('player.id '+socket.player.id+' clicked to '+data.x+', '+data.y);
            socket.player.x = data.x;
            socket.player.y = data.y;
            io.emit('move',socket.player);
        });

        socket.on('resize', function(data){
            //console.log('Server transform');
            socket.player.size = data.size;
            socket.emit('updateSize', {id: socket.player.id, size: socket.player.size});
            socket.broadcast.emit('updateSize', {id: socket.player.id, size: socket.player.size});
            // socket.player.scale = data.scale;
        });

        socket.on('transform', function(data){
            //console.log('Server transform');
            socket.player.x = data.x;
            socket.player.y = data.y;
            socket.player.rotation = data.rotation;
            socket.player.health = data.health;
            socket.broadcast.emit('updateTransform', {id: socket.player.id, x: socket.player.x, y: socket.player.y,
                rotation: socket.player.rotation, health: socket.player.health, isBoosting: data.isBoosting});
            // socket.player.scale = data.scale;
        });

        socket.on('askUpdate', function() {
            findFocused(socket.id, socket.player.id);
            //socket.emit('returnTransform', socket.player);
        });

        socket.on('accelerate',function(data){
            //io.emit('updateAcceleration', socket.player, data.direction);
            socket.emit('updateAcceleration', socket.player, data.direction);
        });

        socket.on('rotate',function(data){
            //io.emit('updateRotation', socket.player, data.angularVelocity);
            socket.emit('updateRotation', socket.player, data.angularVelocity);
        });

        /*socket.on('shoot',function(data){
            //io.emit('updateAcceleration', socket.player);
            socket.emit('updateAcceleration', socket.player);
        });*/
        socket.on('fire',function(data){
            //socket.broadcast.emit('updateFire', data);
            socket.broadcast.emit('updateFire', {x: data.x, y: data.y, rotation: data.rotation, weaponId: data.weaponId, id: data.id});
        });

        socket.on('collect',function(data)
        {
            socket.player.score += data.value;
            socket.broadcast.emit('updateScore', {id: socket.player.id, score: socket.player.score});
            socket.emit('updateScore', {id: socket.player.id, score: socket.player.score});
        });

        socket.on('requestTime', function() {
            var time = Date.now();

            socket.emit('sendTime', {time: time});
        });

        socket.on('shipChange', function(data){
            // console.log("We got an emit of shipChange, shipName is: " + data.shipName);
            socket.player.shipName = data.shipName;
            socket.broadcast.emit('updateShip', socket.player);
        });

        socket.on('disconnect',function(){
            io.emit('remove',socket.player.id);
        });

        socket.on('setAmmo', function(data) {
            socket.player.ammo = data.ammo;
            socket.broadcast.emit('updateAmmo', {id: data.id, ammo: data.ammo, weaponId: data.weaponId});
            socket.emit('updateAmmo', {id: data.id, ammo: data.ammo, weaponId: data.weaponId});
        });
        socket.on('changeAmmo', function(data) {
            socket.player.ammo = data;
        });

        socket.on('changeWeapon', function(data) {
            socket.player.ammo = data.ammo;
            socket.player.weaponId = data.weaponId;
            socket.broadcast.emit('updateAmmo', {id: data.id, ammo: data.ammo, weaponId: data.weaponId});
            socket.emit('updateAmmo', {id: data.id, ammo: data.ammo, weaponId: data.weaponId});
        });

        socket.on('setFocus', function(data) {
            socket.player.focused = data;
            socket.broadcast.emit('removeTrail', {id: socket.player.id, trailSet: data});
            socket.emit('removeTrail', {id: socket.player.id, trailSet: data});
            //console.log('focused: ' + data);
        });
        socket.on('returnCoordinates', function(data) {
            emitMessage(data.id, data.x, data.y, data.rotation, data.health);
            //console.log('health: ' + data.health);
            //io.sockets.connected[data.id].emit('updateCoordinates', {x: data.x, y: data.y, rotation: data.rotation});
        });
    });

    socket.on('test',function(){
        console.log('test received');
    });
});

function incrementID() {
    return server.lastPlayerId + 1;
}

function findFocused(sID, id) {
    Object.keys(io.sockets.connected).forEach(function(socketID) {
        //console.log('socket: ' + socketID);
        //console.log('hawej: ' + io.sockets.connected[socketID].player !== undefined);
        if (io.sockets.connected[socketID].player !== undefined && io.sockets.connected[socketID].player.focused) {
            io.sockets.connected[socketID].emit('askCoordinates', {socketID: sID, id: id});
            //console.log('socket: ' + io.sockets.connected[socketID].player.focused);
        }

    });
}

function emitMessage(id, x, y, rotation, health) {
    //io.sockets.connected[id].emit('updateCoordinates', {x: x, y: y, rotation: rotation});
    Object.keys(io.sockets.connected).forEach(function(socketID) {
        //console.log('id: ' + socketID + ' ' + id);
        if (socketID === id) {
            io.sockets.connected[socketID].emit('updateCoordinates', {x: x, y: y, rotation: rotation, health: health});
            //console.log('health: ' + health);
        }
        //io.sockets.connected[socketID].emit('askCoordinates', id);
    });
}

function getAllPlayers(){
    var players = [];
    Object.keys(io.sockets.connected).forEach(function(socketID){
        var player = io.sockets.connected[socketID].player;
        if(player) {
            players.push(player);
            //console.log('ShipName: ' + player.shipName);
        }
    });
    return players;
}

function randomInt (low, high) {
    return Math.floor(Math.random() * (high - low) + low);
}

var randomTint = function() {
    return ((Math.random()*0xffffff)+200)+((Math.random()*0xffffff)+200)+((Math.random()*0xffffff)+200);
    // return ((Math.random()*0xffffff)|0x0f0f0f);
    //return Math.random() * 0xffffff;
};

function checkNameSafety (id, name) {
    if (name === '')
    {
        return 'Player'+id;
    }

    var unsafeRegex = [/fuck/,/dick/,/pussy/,/piss/,/bastard/,/chode/,/chide/,/boner/,/clit/,/jizz/,/nig/,/kkk/,/cunt/,/ass/,/bitch/,/retard/,/cock/,/tit/,/gooch/,/penis/,/fag/,/vagina/,/wtf/,/kys/,];
    var t = name.toLowerCase();
    for (var i in unsafeRegex)
    {
        if (unsafeRegex[i].test(t))
        {
            return 'Player'+id;
        }
    }

    return name;
}
