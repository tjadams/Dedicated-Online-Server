var net = require('net');

var HOST = '127.0.0.1';
var PORT = 8484;

var server = net.createServer();
server.listen(PORT, HOST);

server.on('connection', function(sock) {


    // handle first connection stuff (if this is called multiple times I'll need to add more logic)

    console.log(sock.remoteAddress +':'+ sock.remotePort+' has connected');

    sock.on('data', function(data) {

        console.log('Data received from' + sock.remoteAddress + ': ' + data);

        // write back to the socket
        //sock.write();
    });

    sock.on('close', function(data) {
        console.log(sock.remoteAddress +':'+ sock.remotePort+' has disconnected');
    });


}).listen(PORT, HOST);
console.log('Server hosted on ' + server.address().address +':'+ server.address().port);

//var express = require('express');
//
//var app = express();
//app.set('port', 8484);
//
//app.listen(app.get('port'), function() {
//    console.log("Server listening on port " + this.address().port);
//});
//
// Socket.io server listens to our app
//var io = require('socket.io').listen(app);
//io.on('connection', function(socket){
//    console.log("User: "+socket.toString()+" has connected");
//});


/*
 // Load the TCP Library
 net = require('net');

 var clients = [];
 var port = "8484"

 net.createServer(function (socket) {
 // identifies connected client
 socket.name = socket.remoteAddress + ":" + socket.remotePort;
 console.log(socket.name +" has connected to app.js");
 //
 //    // Put this new client in the list
 //    clients.push(socket);
 //
 //    // Send a nice welcome message and announce
 //    socket.write("Welcome " + socket.name + "\n");
 //    broadcast(socket.name + " joined the chat\n", socket);

 // Handle incoming messages from clients.
 socket.on('data', function (data) {
 console.log("'data' type of Data: "+data+" from "+socket.name);
 //  broadcast(socket.name + "> " + data, socket);
 // console.log("socket.name + "> " + data, socket");
 });
 // Handle incoming messages from clients.
 socket.on("data", function (data) {
 console.log("'data' type of Data: "+data+" from "+socket.name);
 //  broadcast(socket.name + "> " + data, socket);
 // console.log("socket.name + "> " + data, socket");
 });

 socket.on('', function (data) {
 console.log(" '' type of Data: "+data+" from "+socket.name);
 //  broadcast(socket.name + "> " + data, socket);
 // console.log("socket.name + "> " + data, socket");
 });


 // Remove the client from the list when it leaves
 socket.on('end', function () {
 console.log(socket.name +" has disconnected");
 //        clients.splice(clients.indexOf(socket), 1);
 //        broadcast(socket.name + " left the chat.\n");
 });

 // Send a message to all clients
 function broadcast(message, sender) {
 //        clients.forEach(function (client) {
 //            // Don't want to send it to sender
 //            if (client === sender) return;
 //            client.write(message);
 //        });
 //        // Log it to the server output too
 process.stdout.write(message)
 }

 }).listen(port);

 // Put a friendly message on the terminal of the server.
 console.log("Server running on port "+port+"\n");

 */


