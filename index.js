var express = require('express');
var app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 3000;
const zmq = require('zeromq');

const msgSize = 1032;
// TODO: Auto-Generate:
const PAYLOAD_OFFSET = 8;

var buffer = new ArrayBuffer(msgSize>>3);
var arrayView = new Uint8Array(buffer);
// var id_buf = new ArrayBuffer(2);
var dataView = new DataView(buffer);


var publisher = zmq.socket("pub");
publisher.connect("tcp://127.0.0.1:6000");
// publisher.connectbindSync("tcp://*:6000");
console.log("Publisher bound to port 6000");

//setInterval(function() {
//	  console.log("10001 32 122");
//	  publisher.send("10001 32 122");
//}, 1000);

app.use(express.static(__dirname + '/public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});


function btest(num, bit){
	return ((num>>bit) % 2 != 0)
}

function bset(num, bit){
	return num | 1<<bit;
}

function bclear(num, bit){
	    return num & ~(1<<bit);
}

function bit_set(bufferIdx) {
	byteIdx = (bufferIdx >> 3) + PAYLOAD_OFFSET;
	bitIdx = bufferIdx % 8;
	bValue = arrayView[byteIdx];
	bValue = bValue | 1 << bitIdx;
	arrayView[byteIdx] = bValue;
}
function bit_clear(bufferIdx) {
	byteIdx = bufferIdx >> 3 + PAYLOAD_OFFSET;
	bitIdx = bufferIdx % 8;
	bValue = arrayView[byteIdx];
	bValue = bValue & ~(1 << bitIdx);
	arrayView[byteIdx] = bValue;
} 

function ab2str(buf) {
	return String.fromCharCode.apply(null, new Uint16Array(buf));
} 

function printBuffer() {
	var bufStr = Array.apply([], arrayView).join(",");
	console.log('Buffer =  ' + bufStr);
}

io.on('connection', (socket) => {
	console.log('a user connected'); 
	socket.on('cmd', msg => { 
	console.log('Message ' + msg); 
	dataView.setUint16(0,623);
	bit_set(3);
	bit_set(5);
	bit_set(7);
	bit_set(8);
	bit_clear(5);
	var bufStr = Array.apply([], arrayView).join(",");
	console.log('Buffer =  ' + bufStr);
	var filter = 10001
	      , temperature = 23
	      , relhumidity = 40
	      , update      = `${filter} ${msg} ${bufStr}`;
	publisher.send(update);
	
	// io.emit('chat message', msg);
  });
});

http.listen(port, () => {
  console.log(`Socket.IO server running at http://localhost:${port}/`);
});



