/**
 * Created by Tyler Adams on 29/07/2014.
 */

var SavedLocation = function(){
  this.mapid = 102000000;
};

var SavedLocation = function(mapid, portal){
    this.mapid = mapid;
    this.portal = portal;
};

module.exports = SavedLocation;