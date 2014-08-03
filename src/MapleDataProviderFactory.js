/**
 * Created by Tyler Adams on 02/08/2014.
 */
var fs = require('fs');

var MapleDataProviderFactory = function(){

};

MapleDataProviderFactory.getDataProvider = function(input){

   return getWZ(input, false);
};

function getWZ(input, provideImages){

    // todo check this
    var endsWithWz = input.toLowerCase().splice(input.length-2, input.length);
    var stats = fs.lstatSync(input);

    if (endsWithWz.equals("wz") && !stats.isDirectory()) {
        // todo inside WZFile, add error catching

        return new WZFile(input, provideImages);
    } else {
        // todo inside XMLWZFile, add error catching
        return new XMLWZFile(input);
    }
};

module.exports = MapleDataProviderFactory;