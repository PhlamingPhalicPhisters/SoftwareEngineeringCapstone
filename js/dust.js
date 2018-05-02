//this file handles the generation and removal of in game currency called "dust"
//it keeps a running list of all dust in the game

var dust = function (id, startx, starty, value) {
    //unique id for the food
    //sent by the server
    var id = id;

    //position of the food
    var positionx = startx;
    var positiony = starty;
    var dustvalue = value;

    game.add.sprite(positionx, positiony, 'dust');
}

//List of all dust items in the game (client side)
var dustList = [];


//when dust is added
function addDust (data) {
    dustList.push(new dust(data.id, data.x, data.y, data.value));
}

//when dust is removed
function removeDust (data) {

    var removeItem;
    removeItem = finditembyid(data.id);
    dustList.splice(dustList.indexOf(removeItem), 1);

    //destroy the phaser object
    removeItem.item.destroy(true,false);

}


function finditembyid (id) {

    for (var i = 0; i < dustList.length; i++) {

        if (dustList[i].id == id) {
            return dustList[i];
        }
    }

    return false;
}