/**
 * Created by Tyler Adams on 29/06/2014.
 */

var World = module.exports = function World(stuff){
   this.id = 0;
   this.flag = 0;
   this.eventmessage = "";
   this.channels = null;
};

World.prototype.toString = function(){
    return "AcceptToSHandler";
};

module.exports = World;