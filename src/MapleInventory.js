/**
 * Created by Tyler Adams on 01/08/2014.
 */

var MapleInventory = function(type, slotLimit){
    this.inventory = [];
    this.type = type;
    this.slotLimit = slotLimit;
};

module.exports = MapleInventory;