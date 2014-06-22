var net = require('net');

var HOST = '127.0.0.1';
var PORT = 8484;

var server = net.createServer();
server.listen(PORT, HOST);


// handle first connection stuff (if this is called multiple times I'll need to add more logic)
server.on('connection', function(sock) {


    // handle first connection stuff (if this is called multiple times I'll need to add more logic)

    console.log(sock.remoteAddress +':'+ sock.remotePort+' has connected');

    sock.on('data', function(data) {

        console.log('Data received from' + sock.remoteAddress + ': ' + data);

        // write back to the socket
        //sock.write();
    });

    sock.on('close', function(data) {
        console.log(this.remoteAddress +':'+ this.remotePort+' has disconnected with data: '+data);
    });


}).listen(PORT, HOST);
console.log('Server hosted on ' + HOST +':'+ PORT);