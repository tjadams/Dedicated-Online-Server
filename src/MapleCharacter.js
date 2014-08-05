/**
 * Created by Tyler Adams on 26/07/2014.
 */
var q = require('q');

var SavedLocation = require('./SavedLocation.js');
var SavedLocationType = require('./SavedLocationType.js');
var MapleSkinColor = require('./MapleSkinColor.js');
var MapleJob = require('./MapleJob.js');
var MapleInventoryType = require('./MapleInventoryType.js');
var MapleInventory = require('./MapleInventory.js');

var MapleCharacter = function(){
    this.setStance(0);

    // initialize an empty array of MapleInventory objcets of size 6
    // todo test this next line
    this.inventory = new MapleInventory[MapleInventoryType.values.length];
    this.savedLocations = new SavedLocation[SavedLocationType.values.length];

    var type;
    for( var i = 0; i < MapleInventoryType.values.length; i++){
        type = MapleInventoryType.values[i];
        var b = 24;

        if(type == MapleInventoryType.values.CASH){
            b = 96;
        }

        // todo check
        // I think type.ordinal() means position in the array
        this.inventory[i] = new MapleInventory(type, b);

    }

    for (var i = 0; i < SavedLocationType.values.length; i++) {
        this.savedLocations[i] = null;
    }

    // TODO code quests
    this.setPosition(0, 0);
};

MapleCharacter.prototype.getJob = function() {
    return this.job;
};

MapleCharacter.prototype.getInventory = function(type){
    for( var i = 0; i < MapleInventoryType.values.length; i++){
        if(type == MapleInventoryType.values[i]){
            // todo check
            return this.inventory[i];
        }
    }
    console.error("error returning inventory");
    return null;
};

MapleCharacter.prototype.setPosition = function(x,y){
    this.positionx = x;
    this.positiony = y;
};

MapleCharacter.prototype.setStance = function(stance){
     this.stance = stance;
};


MapleCharacter.loadCharFromDB = function(charid, client, channelserver){
    var ret = new MapleCharacter();
    var rs;

    ret.client = client;
    ret.id = charid;

 return q.nfcall(client.connection.query.bind(client.connection),"SELECT * FROM characters WHERE id = ?",[charid])
        .then(function (results) {
            rs = results;
         if((results[0][0] == null) || (results[0][0] == undefined) || (results[0]
             [0].length == 0)){
             // todo test
                console.error("loading character failed, character not found");
                return;
            }else{
                ret.name = rs[0][0].name;
                ret.level = rs[0][0].level;
                ret.fame = rs[0][0].fame;
                ret.str = rs[0][0].str;
                ret.dex = rs[0][0].dex;
                ret.int_ = rs[0][0].int;
                ret.luk = rs[0][0].luk;
                ret.exp = rs[0][0].exp;
                ret.gachaexp = rs[0][0].gachaexp;
                ret.hp = rs[0][0].hp;
                ret.maxhp = rs[0][0].maxhp;
                ret.mp = rs[0][0].mp;
                ret.maxmp = rs[0][0].maxmp;
                ret.hpMpApUsed = rs[0][0].hpMpUsed;
                ret.hasMerchant = rs[0][0].HasMerchant == 1;
                ret.remainingSp = rs[0][0].sp;
                ret.remainingAp = rs[0][0].ap;
                ret.meso = rs[0][0].meso;
                ret.merchantmeso = rs[0][0].MerchantMesos;
                ret.gmLevel = rs[0][0].gm;
                // todo Check that this returns properly
                ret.skinColor = MapleSkinColor.getById(rs[0][0].skincolor);
                ret.gender = rs[0][0].gender;
                // todo Check that this returns properly
                ret.job = MapleJob.getById(rs[0][0].job);
                ret.finishedDojoTutorial = rs[0][0].finishedDojoTutorial == 1;
                ret.vanquisherKills = rs[0][0].vanquisherKills;
                ret.omokwins = rs[0][0].omokwins;
                ret.omoklosses = rs[0][0].omoklosses;
                ret.omokties = rs[0][0].omokties;
                ret.matchcardwins = rs[0][0].matchcardwins;
                ret.matchcardlosses = rs[0][0].matchcardlosses;
                ret.matchcardties = rs[0][0].matchcardties;
                ret.hair = rs[0][0].hair;
                ret.face = rs[0][0].face;
                ret.accountid = rs[0][0].accountid;
                ret.mapid = rs[0][0].map;
                ret.initialSpawnPoint = rs[0][0].spawnpoint;
                ret.world = rs[0][0].world;
                ret.rank = rs[0][0].rank;
                ret.rankMove = rs[0][0].rankMove;
                ret.jobRank = rs[0][0].jobRank;
                ret.jobRankMove = rs[0][0].jobRankMove;
                var mountexp = rs[0][0].mountexp;
                var mountlevel = rs[0][0].mountlevel;
                var mounttiredness = rs[0][0].mounttiredness;
                ret.guildid = rs[0][0].guildid;
                ret.guildrank = rs[0][0].guildrank;
                ret.allianceRank = rs[0][0].allianceRank;
                ret.familyId = rs[0][0].familyId;
                ret.bookCover = rs[0][0].monsterbookcover;
            // todo Code MonsterBook
              ret.vanquisherStage = rs[0][0].vanquisherStage;
                ret.dojoPoints = rs[0][0].dojoPoints;
                ret.dojoStage = rs[0][0].lastDojoStage;

                // todo Code Guilds

                // todo Code BuddyList


             ret.getInventory(MapleInventoryType.values.EQUIP).setSlotLimit(rs[0][0].equipslots);
             ret.getInventory(MapleInventoryType.values.USE).setSlotLimit(rs[0][0].useslots);
             ret.getInventory(MapleInventoryType.values.SETUP).setSlotLimit(rs[0][0].setupslots);
             ret.getInventory(MapleInventoryType.values.ETC).setSlotLimit(rs[0][0].etcslots);


             // todo Load inventory items in this commented code block
             /*
             var loadedItems = ItemFactory.INVENTORY.loadItems(ret.id, !channelserver);
             var item;
             for (var i =0 ; loadedItems.length; i++) {
                 item = loadedItems[i];

                 // MapleInventory
                 ret.getInventory(item.getRight()).addFromDB(item.getLeft());

                 // todo add pet stuff
                 // todo add MapleRing stuff
             }
               */




            }
        }).then(function() {

            // todo return generated keys like Statement.RETURN_GENERATED_KEYS
            q.nfcall(client.connection.query.bind(client.connection), "SELECT name FROM accounts WHERE id = ?", [ret.accountid])
                .then(function (results) {
                    rs = results;

                    if((results[0][0] == null) || (results[0][0] == undefined) || (results[0]
                        [0].length == 0)){
                        ret.client.setAccountName(rs[0][0].name);
                    }
                }).catch(function (error){
                        console.error("error setting account name in MapleCharacter: "+error);
                });

        }).then(function(){

            q.nfcall(client.connection.query.bind(client.connection), "SELECT `area`,`info` FROM area_info WHERE charid = ?", [ret.id])
                .then(function (results) {
                    rs = results;

                    for(var i = 0; i < rs[0].length; i++){
                        // todo check this area_info works
//                        ret.area_info.put(rs[0][i].area, rs[0][0].info);
                        ret.area_info[rs[0][i].area] = rs[0][0].info;
                    }

                }).catch(function (error){
                        console.error("error setting area_info in MapleCharacter: "+error);
                });
        }).then(function(){
           //todo add event stats to character
            // todo add cashshop
            // todo add autoban
            // todo add marriage

             return q.nfcall(client.connection.query.bind(client.connection), "SELECT name, level FROM characters WHERE accountid = ? AND id != ? ORDER BY level DESC limit 1", [ret.accountid, charid])
                 .then(function (results) {
                     rs = results;
                     if((results[0][0] == null) || (results[0][0] == undefined) || (results[0]
                         [0].length == 0)){
                         ret.linkedName = rs[0][0].name;
                         ret.linkedLevel = rs[0][0].level;
                     }
                     return ret;

                 }).catch(function (error){
                     console.error("error setting area_info in MapleCharacter: "+error);
                 });

         // todo Code ChannelServer MapleCharacter loading
         // todo Code teleport rocks


         // todo code setting accountid and whatever follows that


         // todo add more channelServer stuff to do with quests
            // todo add more mountid maplemount stuff
        }).catch(function (error) {
            console.error("error in loadCharFromDb promise chain in MapleCharacter: "+error);
        });
};

module.exports = MapleCharacter;