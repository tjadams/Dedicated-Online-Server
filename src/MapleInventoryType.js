/**
 * Created by Tyler Adams on 01/08/2014.
 */


var MapleInventoryType = function(){

};

var values = {
    UNDEFINED: 0,
    EQUIP: 1,
    USE: 2,
    SETUP: 3,
    ETC: 4,
    CASH: 5,
    EQUIPPED: -1
};


MapleInventoryType.getById = function(id){
    for(var value in values){
        if(values.value == id){
            return value;
        }
    }
};


module.exports = MapleInventoryType;