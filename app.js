var express = require('express');
var app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 3000;
const zmq = require('zeromq');
const util = require('util');
const {StringDecoder} = require('string_decoder');

const MSG = require('./dhtm_msg/js/msg.js');
const Message = require('./message.js');
const zeroPad = (num, places) => String(num).padStart(places, '0');


const msgSize = MSG.PAYLOAD_OFFSET + MSG.DEF_PL_SIZE;
console.log("MSG Size: " + msgSize);
var msg = new Message(msgSize);


var publisher = zmq.socket("pub");
publisher.connect("tcp://127.0.0.1:6000");
console.log("Publisher bound to port 6000");

var subscriber = zmq.socket('sub');
subscriber.connect('tcp://127.0.0.1:5555');
console.log("Subscriber bound to port 5555");

var sts = 'T' + zeroPad(MSG.MessageType.DATA,3) + '.' + zeroPad(MSG.MessageCommand.PRINT,3);
console.log("Subscribed to topic " + sts);
var sub_topic = Buffer.from(sts);
subscriber.subscribe(sub_topic);

subscriber.on('message', function(topic, message) {
	msg.parse(message);
	console.log('TOPIC: ' + topic);
	console.log('REC ZMQ: ' + msg.toString());
});

app.use(express.static(__dirname + '/public'));

app.get('/', (req, res) => {
	res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
	console.log('On Connection'); 
	socket.on('cmd', cmd => { 
	console.log('RECV UI: ' + cmd); 

	msg.create_header(MSG.MessageType.DATA, MSG.MessageCommand.INPUT, MSG.MessageKey.S_INPUT);

	msg.set_payload_bit(3);
	msg.set_payload_bit(5);
	msg.set_payload_bit(7);
	msg.set_payload_bit(8);
	msg.clear_payload_bit(5);

	const decoder = new StringDecoder('utf8');
	const outb  = Buffer.from(msg.buffer);
	let topic = MSG.MessageType.UNDEFINED;
	if (cmd == "data") {
		console.log('DATA MSG');
		topic = MSG.MessageCommand.INPUT;
	} else {
		console.log('UNDEFINED MSG');
	}
	var pub_topic = Buffer.from(msg.get_topic()); 
	console.log('TOPIC: ' + msg.get_topic());
	console.log('SENT ZMQ: ' + msg.toString());
	publisher.send([pub_topic, outb]);
	
	// io.emit('chat message', msg);
  });
});

http.listen(port, () => {
  console.log(`Socket.IO server running at http://localhost:${port}/`);
});



