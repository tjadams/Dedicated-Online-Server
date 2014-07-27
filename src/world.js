/**
 * Created by Tyler Adams on 29/06/2014.
 */

var World = module.exports = function World(worldID, flag, eventmessage, exprate,droprate, mesorate, bossdroprate){
   this.id = worldID;
   this.flag = flag;
   this.eventmsg = eventmessage;
   this.droprate = droprate;
   this.mesorate = mesorate;
   this.bossdroprate = bossdroprate;

    // initialize the channels to be some type with a length of zero so it doesn't show up in the worlds list yet until I add channels in app.js
    this.channels = [];
   this.connectedClients = 0;
   this.reccomendedMessage = "sup";
    // todo look at party and messenger stuff
};

World.prototype.addChannel = function(channel){
  this.channels.push(channel);
};

World.prototype.toString = function(){
    return "World";
};

module.exports = World;