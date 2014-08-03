/**
 * Created by Tyler Adams on 02/08/2014.
 */
var MapleDataProviderFactory = require('./MapleDataProviderFactory.js');


var instance;

//todo May be c:/users/Tyler Adams/WebstormProjects/Multiplayer-Game-Server/wz
// this part reqiures WZ files
var wzPath = "C:\\Users\\Tyler Adams\\WebstormProjects\\Multiplayer-Game-Server\\wz";


var MapleItemInformationProvider = function(){

    // todo load monsterbook data

    // todo fix the directory backslash stuff
    this.itemData = MapleDataProviderFactory.getDataProvider(wzPath + "/Item.wz");
    this.equipData = MapleDataProviderFactory.getDataProvider(wzPath + "/Character.wz");
    this.stringData = MapleDataProviderFactory.getDataProvider(wzPath + "/String.wz");

    // xmlwzfile should be returned
    this.cashStringData = this.stringData.getData("Cash.img");
    this.consumeStringData = this.stringData.getData("Consume.img");
    this.eqpStringData = this.stringData.getData("Eqp.img");
    this.etcStringData = this.stringData.getData("Etc.img");
    this.insStringData = this.stringData.getData("Ins.img");

    // todo Add pet stuff later
//    this.petStringData = this.stringData.getData("Pet.img");

};

MapleItemInformationProvider.getInstance = function(){
    if(instance == null){
        instance = new MapleItemInformationProvider();
    }
    return instance;
};

module.exports = MapleItemInformationProvider;