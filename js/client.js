var Client = {};
Client.socket = io.connect();
Client.id = -1;

Client.askNewPlayer = function(){
    Client.socket.emit('newplayer');
}

Client.socket.on('newplayer',function(data){
    console.log('id: ');
    if (Client.id == -1) {
        Client.id = data.id;
        console.log('id: ' + data.id);
    }
    Game.addNewPlayer(data.id,data.x,data.y);

});

Client.socket.on('allplayers',function(data){
    console.log('new player joined');
    //console.log(data);
    for(var i = 0; i < data.length; i++){
        if (data[i].id != Client.id) {
            Game.addNewPlayer(data[i].id, data[i].x, data[i].y);
        }
    }
});

Client.socket.on('remove',function(id){
    Game.removePlayer(id);
});

Client.sendClick = function(x, y) {
    Client.socket.emit('click', {x: x, y: y});
    console.log('sent');
}

Client.socket.on('move', function(data) {
    Game.movePlayer(data.id, data.x, data.y);
});