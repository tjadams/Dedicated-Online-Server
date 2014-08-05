/**
 * Created by Tyler Adams on 01/08/2014.
 */

var MapleInventory = function(type, slotLimit){
    this.inventory = [];
    this.type = type;
    this.slotLimit = slotLimit;
};

MapleInventory.prototype.list = function(){
    return this.inventory;
};

MapleInventory.prototype.getItem = function(slot){
    return this.inventory[slot];
};

module.exports = MapleInventory;