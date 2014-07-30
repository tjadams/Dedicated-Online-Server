/**
 * Created by Tyler Adams on 26/07/2014.
 */
var q = require('q');

var SavedLocation = require('./SavedLocation.js');
var SavedLocationType = require('./SavedLocationType.js');
var MapleSkinColor = require('./MapleSkinColor.js');
var MapleJob = require('./MapleJob.js');

var MapleCharacter = function(){
    this.setStance(0);

    // TODO code Inventory
    this.savedLocations = new SavedLocation[SavedLocationType.values.length];

    // Todo code Inventory

    for (var i = 0; i < SavedLocationType.values.length; i++) {
        this.savedLocations[i] = null;
    }

    // TODO code quests
    this.setPosition(0, 0);

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

    q.nfcall(client.connection.query.bind(client.connection),"SELECT * FROM characters WHERE id = ?",[charid])
        .then(function (results) {
            rs = results;
            if(results[0][0].length == 0){
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
              // todo Code Inventory
              // todo code MapleInventoryType etc
                 // todo Code ChannelServer MapleCharacter loading
                // todo Code teleport rocks


                // todo code setting accountid and whatever follows that
            }
        }).catch(function (error) {
            console.error("promise error: "+error);
        }).done();

    return ret;

};

module.exports = MapleCharacter;