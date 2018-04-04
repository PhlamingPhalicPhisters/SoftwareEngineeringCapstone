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

server.listen(process.env.PORT || 8081,function(){
    console.log('Listening on '+server.address().port);
});

io.on('connection',function(socket){

    socket.on('newplayer',function(){
        socket.player = {
            id: server.lastPlayerId++,
            x: randomInt(100,500),
            y: randomInt(100,500),
            rotation: 0,
            health: 100
        };
        console.log('Player '+socket.player.id+' connected');
        socket.broadcast.emit('newplayer',socket.player);
        socket./*broadcast.*/emit('newplayer',socket.player);
        socket.emit('allplayers',getAllPlayers());

        /*socket.on('getplayer',function(data){
            socket.emit('setplayer',socket.player);
        });*/

        socket.on('click',function(data){
            console.log('player.id '+socket.player.id+' clicked to '+data.x+', '+data.y);
            socket.player.x = data.x;
            socket.player.y = data.y;
            io.emit('move',socket.player);
        });

        socket.on('transform', function(data){
            //console.log('Server transform');
            socket.player.x = data.x;
            socket.player.y = data.y;
            socket.player.rotation = data.rotation;
            socket.broadcast.emit('updateTransform', socket.player);
            // socket.player.scale = data.scale;
        });

        socket.on('accelerate',function(data){
            //io.emit('updateAcceleration', socket.player, data.direction);
            socket.emit('updateAcceleration', socket.player, data.direction);
        });

        socket.on('rotate',function(data){
            //io.emit('updateRotation', socket.player, data.angularVelocity);
            socket.emit('updateRotation', socket.player, data.angularVelocity);
        });

        socket.on('shoot',function(data){
            //io.emit('updateAcceleration', socket.player);
            socket.emit('updateAcceleration', socket.player);
        });

        // socket.on('move', function(data){
        //     console.log('player')
        // }

        socket.on('disconnect',function(){
            io.emit('remove',socket.player.id);
        });
    });

    socket.on('test',function(){
        console.log('test received');
    });
});

function getAllPlayers(){
    var players = [];
    Object.keys(io.sockets.connected).forEach(function(socketID){
        var player = io.sockets.connected[socketID].player;
        if(player) players.push(player);
    });
    return players;
}

function randomInt (low, high) {
    return Math.floor(Math.random() * (high - low) + low);
}
