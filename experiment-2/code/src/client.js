'use strcit';

const dgram = require('dgram');
const socket = dgram.createSocket('udp4');
const counter = require('./counter')

const HOST = '127.0.0.1';
const PORT = '8888';
const windowSize = 5;
const timeout = 500;

socket.bind();

const seg = counter(8);
const last_ack = counter(8);

const msg = new Buffer("Hello World");


const packages = (() => {
    let package_result = [];
    for (let i = 0, l = msg.length; i < l; i++) {
        package_result.push(msg.slice(i, i + 1))
    }
    return package_result;
})();

const start = (() => {
    let handle = null;
    return () => {
        if (handle !== null) {
            clearTimeout(handle);
        }
        for (let i = 0, l = last_ack.minus(last_ack.get_base()); i < l; i++) {
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
    }
})();

const send_one_package = (buffer, id) => {

    const tep = new Buffer(1);
    tep.writeInt8(id);
    const data = Buffer.concat([tep, buffer]);
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
const send_window = function() {
    var i, j, ref, results;
    seg.set_now(last_ack.get_now());
    console.log("sendding window lastACK:" + (last_ack.get_now()));
    //for (let i = 0; i <= windowSize; ++i) {
    for (i = j = 0, ref = windowSize; j < ref; i = 0 <= ref ? ++j : --j) {
        if (packages[i] != null) {
            send_one_package(packages[i], seg.go());
        }
    }

};
socket.on('message', (msg) => {
    let ACK = msg.readInt8();
    if (!last_ack.gt(ACK)) {
        while (last_ack.get_now() != ACK) {
            last_ack.go();
        }
    }
    console.log(`receive ACK ${ACK}, last_ack： ${last_ack.get_now()}`);
    return;
});

socket.on('error', (err) => {
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