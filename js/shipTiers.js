// assigns ships based off on input given from safe zone menu
// multipliers

var tierTwoMultiplier = 1.5;
var tierThreeMultiplier = 2;
var tierFourMultiplier = 3;
var tierFiveMultiplier = 5;

//identify tier
function shipTierAssign(shipName){
    if(shipName == 'ship1' || shipName == 'ship2' || shipName == 'ship7'){
      assignTierOneShip(shipName);
    }
    else if (shipName == 'ship8' || shipName == 'ship9' || shipName == 'ship10' ){
        assignTierTwoShip(shipName);
    }
    else if (shipName == 'ship5' || shipName == 'ship6'|| shipName == 'ship4'){
        assignTierThreeShip(shipName);
    }
    else if (shipName == 'ship13' || shipName == 'ship12' || shipName == 'ship11'){
        assignTierFourShip(shipName);
    }
    else if ( shipName == 'ship14' || shipName =='ship15' || shipName == 'ship3'){
        assignTierFiveShip(shipName);
    }
};

function assignTierOneShip(shipName){

    //Ship1
    //Ship2 //Assigned in assignShip in game.js
    //Ship7
    handleShipUpdate(shipName);
    tierMultiplier(1);
    Client.sendResize(64);
};

function assignTierTwoShip(shipName){ //

    //Ship8
    //Ship9
    //Ship10
    //Ship4
    handleShipUpdate(shipName);
    Client.sendResize(70);
    tierMultiplier(tierTwoMultiplier);
};

function assignTierThreeShip(shipName) {

    //Ship6
    //Ship5
    handleShipUpdate(shipName);
    tierMultiplier(tierThreeMultiplier);
    Client.sendResize(80);
    Game.playerMap[Client.id].normalAccel = 350;
};

function assignTierFourShip(shipName) {

    //Ship13
    //Ship12
    //Ship11
    handleShipUpdate(shipName);
    tierMultiplier(tierFourMultiplier);
    Client.sendResize(90);
    Game.playerMap[Client.id].normalAccel = 400;
};

function assignTierFiveShip(shipName) {

    //Ship14
    //Ship15
    handleShipUpdate(shipName);
    tierMultiplier(tierFiveMultiplier);
    Client.sendResize(100);
    Game.playerMap[Client.id].normalAccel = 400;
};

//Helpers
function tierMultiplier(multiplier){
    Game.playerMap[Client.id].maxHealth = 100; //starting amount
    Game.playerMap[Client.id].maxHealth *= multiplier;
    Game.playerMap[Client.id].heal(600); //fill to max health
    Game.maxWeaponAmmo = [250 * multiplier, 500 * multiplier, 100 * multiplier];
    //Game.playerMap[Client.id].ammo = Game.maxWeaponAmmo;
    Game.maxBoost = 5000 * multiplier;
    //Game.playerMap[Client.id].boost = Game.maxBoost;
};

function handleShipUpdate(shipName){
    Game.playerMap[Client.id].shipName = shipName;
    Game.updatePlayerShip(Client.id,shipName);
    Client.sendShipChange(shipName);
};