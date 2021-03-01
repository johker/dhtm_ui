var express = require('express');
var app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 3000;
const zmq = require('zeromq');
const util = require('util');
const {StringDecoder} = require('string_decoder');
import * as MSG from '../dhtm_msg/ts/msg';

const msgSize = 1032;

var buffer = new ArrayBuffer(msgSize>>3);
var arrayView = new Uint8Array(buffer);
// var id_buf = new ArrayBuffer(2);
var dataView = new DataView(buffer);


var publisher = zmq.socket("pub");
publisher.connect("tcp://127.0.0.1:6000");
// publisher.connectbindSync("tcp://*:6000");
console.log("Publisher bound to port 6000");

var subscriber = zmq.socket('sub');
subscriber.connect('tcp://127.0.0.1:5555');
console.log("Subscriber bound to port 5555");

var topic = Buffer.from(''); 
subscriber.subscribe(topic);

subscriber.on('message', function(message) {
	// console.log(message);
	// Convert to ArrayBuffer
	var arrayBuffer = new Uint8Array(message).buffer;
	console.log('REC ZMQ: ' + printBuffer());
});

app.use(express.static(__dirname + '../public'));

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

function bit_set(bufferIdx: number) {
	let byteIdx: number = (bufferIdx >> 3) + MSG.PAYLOAD_OFFSET;
	let bitIdx: number = bufferIdx % 8;
	let bValue: number = arrayView[byteIdx];
	bValue = bValue | 1 << bitIdx;
	arrayView[byteIdx] = bValue;
}

function bit_clear(bufferIdx: number) {
	let byteIdx: number = bufferIdx >> 3 + MSG.PAYLOAD_OFFSET;
	let bitIdx: number = bufferIdx % 8;
	let bValue: number = arrayView[byteIdx];
	bValue = bValue & ~(1 << bitIdx);
	arrayView[byteIdx] = bValue;
} 

function printBuffer() {
	var bufStr = Array.apply([], arrayView).join(",");
	var update = `${bufStr}`;
	return update;
}

io.on('connection', (socket) => {
	console.log('On Connection'); 
	socket.on('cmd', msg => { 
	console.log('RECV UI: ' + msg); 
	let msg_id: number = 1;

	dataView.setUint16(MSG.ID_OFFSET,1);
	dataView.setUint16(MSG.TYPE_OFFSET, MSG.MessageType.DATA);
	dataView.setUint16(MSG.CMD_OFFSET,MSG.MessageCommand.INPUT);
	dataView.setUint16(MSG.KEY_OFFSET, MSG.MessageKey.S_INPUT);

	bit_set(3);
	bit_set(5);
	bit_set(7);
	bit_set(8);
	bit_clear(5);

	const decoder = new StringDecoder('utf8');
	const outb  = Buffer.from(buffer);
	let topic = MSG.MessageType.UNDEFINED;
	if (msg.localCompare("data")) {
		topic = MSG.MessageType.DATA;
	}
	console.log('TOPIC: ' + topic.toString());
	console.log('SENT ZMQ: ' + printBuffer());
	publisher.send([topic, outb]);
	
	// io.emit('chat message', msg);
  });
});

http.listen(port, () => {
  console.log(`Socket.IO server running at http://localhost:${port}/`);
});



