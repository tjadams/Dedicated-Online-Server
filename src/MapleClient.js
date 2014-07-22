var mysql = require('mysql');
var q = require('q');
var MaplePacketCreator = require('./MaplePacketCreator');

exports.values = {
    // TODO add more opcodes for v83
    LOGIN_NOTLOGGEDIN: 0,
    LOGIN_SERVER_TRANSITION: 1,
    LOGIN_LOGGEDIN: 2
};

var LOGIN_NOTLOGGEDIN = 0;
var LOGIN_SERVER_TRANSITION = 1;
var LOGIN_LOGGEDIN = 2;


var MapleClient = module.exports = function MapleClient(sendCypher, recvCypher, sock, connection) {
    this.send = sendCypher;
    this.receive = recvCypher;
    this.session = sock;
    this.pinattempt = 0;
    this.loginattempt = 0;
    this.accountName = "";
    this.accId = 0;
    this.gmlevel = 0;
    this.pin = 0;
    this.pic = 0;
    this.characterSlots = 0;
    this.gender = "";
    this.loggedIn = false;

    this.state = 0;
    //this.state = LOGIN_NOTLOGGEDIN;
    this.connection = connection;
};


MapleClient.prototype.loginMaple = function(login, pwd){
    console.log("Account: "+this.accountName+" entered login().");

    this.loginattempt++;
    if (this.loginattempt > 4) {
        console.log("Account: "+this.accountName+" too many attempts, closing");
        this.session.destroy();
    }
    var loginok = 5;

    // TODO NOTE: this refers to the connection when I'm inside the mysql conenction, so I need a client reference if I want to call this as a MapleClient object
    var clientReference = this;

    console.log("Account: "+clientReference.accountName+" preparing database statement");

    var rs, gotLoginState, passhash, salt, tos, finishedLogin;
   q.nfcall(clientReference.connection.query.bind(clientReference.connection),  "SELECT id, password, salt, gender, banned, gm, pin, pic, characterslots, tos FROM accounts WHERE name = ?",[login])
   .then(function (results) {
           rs = results;

           // TODO add an existance check of rs like in the other methods in this class

           // todo finish coding banned stuff later
           if (rs[0][0].banned == 1) {
               loginok = 3;
           }

           clientReference.accId = rs[0][0].id;
           clientReference.gmlevel = rs[0][0].gm;
           clientReference.pin = rs[0][0].pin;
           clientReference.pic = rs[0][0].pic;
           clientReference.gender = rs[0][0].gender;
           clientReference.characterSlots = rs[0][0].characterslots;
           passhash = rs[0][0].password;
           salt = rs[0][0].salt;
           tos = rs[0][0].tos;

           return getLoginState(clientReference)
               .then(function (state) {
                   gotLoginState = state;

                   // 0 is LOGIN_NOTLOGGEDIN
                   if (gotLoginState > 0) {
                       clientReference.loggedIn = false;
                       loginok = 7;
                   }
                   // TODO add a method similar to MoopleDev's checkHash
                   else if (pwd == passhash) {
                       if (tos == 0) {
                           loginok = 23;
                       } else {
                           loginok = 0;
                       }
                   } else {
                       clientReference.loggedIn = false;
                       loginok = 4;
                   }
               }).catch(function (error) {
                   console.error("loginMaple getLoginState error: " + error);
               });
       }).then(function() {
           q.nfcall(clientReference.connection.query.bind(clientReference.connection), "INSERT INTO iplog (accountid, ip) VALUES (?, ?)",[clientReference.accId, clientReference.session.remoteAddress])
               .then( function (results) {
                   console.log("inserted results: " + rs[0][0]);
               }).catch(function(error){
                  console.error("loginMaple error inserting results: "+error);
               });
       }).then(function() {
           return clientReference.finishLogin(clientReference)
               .then(function(results){
                   finishedLogin = results;
                   // reset the client's loginattempts if login is successful
                   if (loginok == 0) {
                       clientReference.loginattempt = 0;
                   }

                   console.log("\n\nloginok = "+loginok+" login = "+login+" pwd = "+pwd);
                   if (loginok != 0) {
                       console.log("Account: "+clientReference.getAccountName()+ " login failed, most likely disconnecting");
                       clientReference.announce(MaplePacketCreator.getLoginFailed(loginok));

                       //todo test this
                       console.log("loginMaple about to return in finishLogin promise, not sure what this will do...");
                       return;
                   }

                   // successful login
                   if (finishedLogin == 0) {
                       clientReference.announce(MaplePacketCreator.getAuthSuccess(clientReference));
                       console.log("Account: "+clientReference.getAccountName()+ "logged in successfuly");
                       // TODO add idle client disconnection for logged in clients
                   } else {
                       clientReference.announce(MaplePacketCreator.getLoginFailed(7));
                       console.log("Account: "+clientReference.getAccountName()+ "login failed");
                   }
               }).catch(function (error) {
                   console.log("loginMaple error in finishLogin promise chaining: " + error);
               });
       }).catch(function (error) {
            console.log("error in loginMaple chaining: "+error);
        }).done();
};


// NOTE: here is an example of having chaining with promises inside conditionals
var getLoginState = function(clientReference){
    var nextPromise, nextFunction, nextFunctionContent;
    // using a tri-state here: 0 means select no function because still not loggedin, 1 means select the updateloginstate function, 2 means update query
    var nextFunctionIsQuery = 0;
    var returnValue;
 return q.nfcall(clientReference.connection.query.bind(clientReference.connection), "SELECT loggedin, lastlogin, UNIX_TIMESTAMP(birthday) as birthday FROM accounts WHERE id = ?",[clientReference.accId])
        .then(function (results) {

         if((results[0][0] == null) || (results[0][0] == undefined) || (results[0]
             [0].size == 0)){
             console.log("rs loggedin doesn't exist");
         }else{
            // TODO add birthday stuff
            console.log("UPDATE loggedin results: " + results[0][0]);

            clientReference.state = results[0][0].loggedin;
          // 1 is LOGIN_SERVER_TRANSITION
            if (clientReference.state == 1) {
                if (results[0][0].lastlogin.getTime() + 30000 < new Date().getTime()) {
                    // 0 is LOGIN_NOTLOGGEDIN
                    clientReference.state = 0;
                    // TODO I think what I'm doing in the big if else block with nextpromise stuff fixes the possible race conditions I would have had otherwise
//                    nextFunction = clientReference.updateLoginState;
                    nextFunctionIsQuery = 1;
//                    nextFunctionContent = clientReference.LOGIN_NOTLOGGEDIN;
                }
            }

          // 2 is LOGIN_LOGGEDIN
            if (clientReference.state == 2) {
                clientReference.loggedIn = true;
            }else if (clientReference.state == 1) {

//                nextFunction = clientReference.connection.query.bind(clientReference.connection);
                nextFunctionIsQuery = 2;
//                nextFunctionContent ='"UPDATE accounts SET loggedin = 0 WHERE id = ?",[clientReference.accId]';
            } else {
                clientReference.loggedIn = false;
            }

           // NOTE: only the else statement needs denodeify, this first one is just a normal method so I can pass it nextfunction
            if(nextFunctionIsQuery == 1) {
                // todo not sure if I should be returning or just calling
                clientReference.updateLoginState(0)
                .catch(function (error) {
                    console.log("error in nextFunction chaining updateLoginState: "+error);
                });
            }
            // only other option is querydb
            else if (nextFunctionIsQuery==2) {
                // todo not sure if I should be returning or just calling
                q.nfcall(clientReference.connection.query.bind(clientReference.connection),"UPDATE accounts SET loggedin = 0 WHERE id = ?",[clientReference.accId])
                    .then(function (results){
                        console.log("updated results in nextFunction chaining: "+results[0][0]);
                    })
                    .catch(function (error) {
                        console.log("error in nextFunction chaining: "+error);
                    });
            }

            // todo the method is done so I should return the current state as if I were returning from the main part of this method
            // todo to further ensure that this returns as if it were in the main part of this method, I can check to see if this return makes the promise have the value of clientReference.state and then if it does, I can just return the promise
            return (clientReference.state);
         }
        }).catch(function (error){
            console.error(' back to 2007 we go!! '+error);
            clientReference.loggedIn = false;
        });
};

MapleClient.prototype.setAccountName = function (login) {
    this.accountName = login;
};

MapleClient.prototype.getAccountName = function(){
    return this.accountName;
};

MapleClient.prototype.finishLogin = function(clientReference){
    var loginResults, hasReturned = false;
    // NOTE: the client keeps going so I need to use promises here
    return getLoginState(clientReference)
        .then(function (results) {
            loginResults = results;

            // notloggedin is 0
            if (loginResults > 0) {
                // return an arbitrary number != 0 to not satisfy the if statement in AcceptToSHandler
                hasReturned = true;
                return 7;
            }

            if(hasReturned){
                // do nothing because the function is returning the promise which is really the value 7
            }else{
                return clientReference.updateLoginState(2)
                    .then(function (){
                        return 0;
                    }).catch(function (error){
                        console.error('updatePromise error: '+error);
                    });
            }
        }).catch(function (error){
            console.error(' finishLogin chaining error: '+error);
        });
};

MapleClient.prototype.updateLoginState = function(newstate){

    // todo ENSURE that this is a real MapleClient object
    var clientReference = this;
    // I'm using promises here to avoid a race condition with getting and updating login states
    return q.nfcall(clientReference.connection.query.bind(clientReference.connection), "UPDATE accounts SET loggedin = ?, lastlogin = CURRENT_TIMESTAMP() WHERE id = ?", [newstate, clientReference.accId])
    .then(function (results){
        console.log("UPDATE loggedin results: "+results);
        if (newstate == 0) {
            clientReference.loggedIn = false;
            clientReference.serverTransition = false;
        } else {
            clientReference.serverTransition = (newstate == 1);
            clientReference.loggedIn = !clientReference.serverTransition;
        }
    }).catch(function (error){
        console.error('updateLoginState error: '+error);
    });
};

MapleClient.prototype.setAccId = function(accountID){
  this.accId = accountID;
};

MapleClient.prototype.getAccID = function(){
    return this.accId;
};

MapleClient.prototype.toString = function () {
    return ("" + this.session + " " + this.send + " " + this.receive);
};

MapleClient.prototype.setWorld = function (world) {
    this.world = world;
};

MapleClient.prototype.setChannel = function (channel) {
    this.channel = channel;
};

MapleClient.prototype.announce = function (packet){
    this.session.write(packet);
};

MapleClient.prototype.getPin = function(){
    return this.pin;
};

MapleClient.prototype.setPin = function(pin){
    this.pin = pin;
};

MapleClient.prototype.checkPin = function(pin){
   this.pinattempt = this.pinattempt + 1;
   if(this.pinattempt > 5){
       // destroy the socket connection
       this.session.destroy();
   }

    if(this.pin == pin){
        this.pinattempt = 0;
        return true;
    }
    return false;
};

MapleClient.prototype.acceptToS = function(){
    // todo add non-blocking io with a callback
    var shouldDisconnect = false;
    var clientReference = this;

    if(this.accountName == null){
        return true;
    }

    return q.nfcall(clientReference.connection.query.bind(clientReference.connection), "SELECT `tos` FROM accounts WHERE id = ?",[clientReference.accId])
        .then(function (results){
            console.log("acceptToS results: "+results);
            if (results != null) {
                if (results[0].tos == 1) {
                    shouldDisconnect = true;
                }
            }

            return q.nfcall(clientReference.connection.query.bind(clientReference.connection), "UPDATE accounts SET tos = 1 WHERE id = ?", [clientReference.accId])
                .then(function(results){
                    console.log("acceptToS update results: "+results);
                    return shouldDisconnect;
                }).catch(function (error){
                    console.error('acceptToS promise update error: '+error);
                });

        }).catch(function (error){
            console.error('acceptToS promise error: '+error);
        });
};

MapleClient.prototype.setDecoderState = function(decoderState){
    this.decoderState = decoderState;
};

MapleClient.prototype.setDecoderPacketLength = function(decoderPacketLength){
    this.decoderPacketLength = decoderPacketLength;
};

MapleClient.prototype.getDecoderPacketLength = function(){
    return this.decoderPacketLength;
};

MapleClient.prototype.getReceiveCrypto = function(){
    return this.receive;
};


MapleClient.prototype.getDecoderState = function(){
    return this.decoderState;
};

module.exports = MapleClient;