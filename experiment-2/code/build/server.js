'use strict';

var dgram = require('dgram');
var counter = require('./counter');
var socket = dgram.createSocket('udp4');

var PORT = '8888';

socket.bind(PORT);

var seg = counter(8);

socket.on('message', function (msg, info) {

    var id = msg.readInt8();
    var content = '' + msg.slice(1);

    if (seg.next() === id) {
        seg.go();
        console.log(content.length + ' byte from ' + info.address + ':' + info.port + '. Accepted id: id: ' + id + ', content: ' + content);
    } else {
        console.log(content.length + ' byte from ' + info.address + ':' + info.port + '. Droped id: id: ' + id + ', content: ' + content);
    }

    if (Math.random() < 0.5) {
        console.log('Not sending the ACK, id: ' + seg.get_now());
        return;
    }

    var ACK = new Buffer(1);
    ACK.writeInt8(seg.get_now());
    socket.send(ACK, 0, ACK.length, info.port, info.address);
    return;
});

socket.on('error', function (err) {
    console.log(err);
});