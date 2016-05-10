'use strict';

const http = require('http');
const url = require('url');
const net = require('net');

const hostname = '127.0.0.1';
const port = '8888';


// 隧道代理
const connect = (creq, csock) => {
    
    console.log(creq.headers);
    
    const u = url.parse('http://' + creq.url);
    
    const psock = net.connect(u.port, u.hostname, () => {
        csock.write('HTTP/1.1 200 Connection Established\r\n\r\n');
        psock.pipe(csock);
    }).on('error', (e) => {
        csock.end();
    });
    
    csock.pipe(psock);
}

// 普通代理
const request = (creq, cres) => {
    
    console.log(creq.headers);
    
    const u = url.parse(creq.url);
    
    const options = {
        hostname: u.hostname,
        port: u.port || 80,
        path: u.path,
        method: u.method,
        headers: u.headers
    };
    
    const purposeReq = http.request(options, (purposeRes) => {
        if(options.hostname == 'life.rccoder.net') {
            
        }
        cres.writeHead(purposeRes.statusCode, purposeRes.headers);
        purposeRes.pipe(cres);
        
    }).on('error', (e) => {
        cres.end();
    });
    
    creq.pipe(purposeReq);
};

const proxy = http.createServer()
    .on('request', request)
    .on('connect', connect);
    
proxy.listen(port, hostname, () => {
    console.log(`Proxy run in ${hostname}:${port}`);
});
