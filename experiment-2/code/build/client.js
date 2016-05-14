'use strict';
'use strcit';

var dgram = require('dgram');
var socket = dgram.createSocket('udp4');
var counter = require('./counter');

var HOST = '127.0.0.1';
var PORT = '8888';
var windowSize = 5;
var timeout = 500;

socket.bind();

var seg = counter(8);
var last_ack = counter(8);

var msg = new Buffer("Hello World");

var packages = (function () {
    var package_result = [];
    for (var i = 0, l = msg.length; i < l; i++) {
        package_result.push(msg.slice(i, i + 1));
    }
    return package_result;
})();

var start = (function () {
    var handle = null;
    return function () {
        if (handle !== null) {
            clearTimeout(handle);
        }
        for (var i = 0, l = last_ack.minus(last_ack.get_base()); i < l; i++) {
            packages.shift();
        }
        if (packages.length === 0) {
            console.log('finshed!');
            return;
        }
        last_ack.reset_base(last_ack.get_now());
        seg.set_now(last_ack.get_now());
        send_window();
        handle = setTimeout(start, timeout);
        return;
    };
})();

var send_one_package = function send_one_package(buffer, id) {

    var tep = new Buffer(1);
    tep.writeInt8(id);
    var data = Buffer.concat([tep, buffer]);
    socket.send(data, 0, data.length, 8888, HOST);
};
/*
const send_window = () => {
    seg.set_now(last_ack.get_now());
    console.log(`Sending window last ack`, last_ack.get_now());
    for (let i = 0; i < windowSize; i++) {
        if (packages[i] !== null) {
            send_one_package(packages[i], seg.go());
        }
    }
};
*/
var send_window = function send_window() {
    var i, j, ref, results;
    seg.set_now(last_ack.get_now());
    console.log("sendding window lastACK:" + last_ack.get_now());
    //for (let i = 0; i <= windowSize; ++i) {
    for (i = j = 0, ref = windowSize; j < ref; i = 0 <= ref ? ++j : --j) {
        if (packages[i] != null) {
            send_one_package(packages[i], seg.go());
        }
    }
};
socket.on('message', function (msg) {
    var ACK = msg.readInt8();
    if (!last_ack.gt(ACK)) {
        while (last_ack.get_now() != ACK) {
            last_ack.go();
        }
    }
    console.log('receive ACK ' + ACK + ', last_ack： ' + last_ack.get_now());
    return;
});

socket.on('error', function (err) {
    console.log(err);
});

start();

/*
var counter, dgram, lastACK, msg, pSize, packets, seg, sendOne, sendWindow, socket, startPoint, startTick, timeout, wSize;

dgram = require('dgram');

counter = require('./counter.js');

socket = dgram.createSocket('udp4');

socket.bind();

wSize = 5;

pSize = 1;

timeout = 500;

seg = counter(8);

lastACK = counter(8);

startPoint = 0;

msg = new Buffer("hello world hello world hello world hello world hello world hello world hello world hello world");

packets = (function() {
    var i, results;
    i = 0;
    results = [];
    while (i < msg.length) {
        i += pSize;
        results.push(msg.slice(i - pSize, i));
    }
    return results;
})();

startTick = (function() {
    var handle;
    handle = null;
    return function() {
        var i, j, ref, resnum;
        if (handle) {
            clearTimeout(handle);
        }
        for (i = j = 0, ref = lastACK.minus(lastACK.get_base()); 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
            packets.shift();
        }
        if (packets.length === 0) {
            return console.log("finished!");
        }
        resnum = 0;
        lastACK.reset_base(lastACK.get_now());
        seg.set_now(lastACK.get_now());
        sendWindow();
        return handle = setTimeout(startTick, timeout);
    };
})();

sendOne = function(buffer, id) {
    var data, s;
    s = new Buffer(1);
    s.writeInt8(id);
    data = Buffer.concat([s, buffer]);
    return socket.send(data, 0, data.length, 8888, '127.0.0.1');
};

sendWindow = () => {
    seg.set_now(lastACK.get_now());
    console.log(`Sending window last ack`, lastACK.get_now());
    for (let i = 0; i < wSize; i++) {
        if (packets[i] !== null) {
            sendOne(packets[i], seg.go());
        }
    }
};


sendWindow = function() {
    var i, j, ref, results;
    seg.set_now(lastACK.get_now());
    console.log("sendding window lastACK:" + (lastACK.get_now()));
    results = [];
    for (i = j = 0, ref = wSize; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
        if (packets[i] != null) {
            results.push(sendOne(packets[i], seg.go()));
        } else {
            results.push(void 0);
        }
    }
    return results;
};

socket.on('message', function(msg, rinfo) {
    var ACK;
    ACK = msg.readInt8();
    if (!lastACK.gt(ACK)) {
        while (lastACK.get_now() !== ACK) {
            lastACK.go();
        }
    }
    return console.log("receive ACK:" + ACK + " lastACK:" + (lastACK.get_now()));
});

socket.on('error', function(err) {
    return console.log(err);
});

startTick();
*/