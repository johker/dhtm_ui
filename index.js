var express = require('express');
var app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 3000;
const zmq = require('zeromq');

var n = 1024;
var buffer = new ArrayBuffer(n>>3);
let bufferView = new Uint8Array(buffer);

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
	byteIdx = bufferIdx >> 3;
	bitIdx = bufferIdx % 8;
	bValue = bufferView[byteIdx];
	bValue = bufferView[byteIdx];
	console.log('Old: ' + bValue.toString(2));
	bValue = bValue | 1 << bitIdx;
	console.log('New: ' + bValue.toString(2));
	bufferView[byteIdx] = bValue;
}
function bit_clear(bufferIdx) { 
	byteIdx = bufferIdx >> 3;
	bitIdx = bufferIdx % 8;
	bValue = bufferView[byteIdx];
	console.log('Old: ' + bValue.toString(2));
	bValue = bValue & ~(1 << bitIdx);
	console.log('New: ' + bValue.toString(2));
	bufferView[byteIdx] = bValue;
} 

function ab2str(buf) {
	return String.fromCharCode.apply(null, new Uint16Array(buf));
} 

io.on('connection', (socket) => {
	console.log('a user connected'); 
	socket.on('cmd', msg => { 
		console.log('Message ' + msg); 
	bit_set(3);
	bit_set(5);
	bit_set(7);
	bit_set(8);
	bit_clear(5);
	
	var filter = 10001
	      , temperature = 23
	      , relhumidity = 40
	      , update      = `${filter} ${msg} ${buffer}`;
	console.log(update);

	publisher.send(update);
	
	// io.emit('chat message', msg);
  });
});

http.listen(port, () => {
  console.log(`Socket.IO server running at http://localhost:${port}/`);
});



