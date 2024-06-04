const uuid = require('uuid');
const { sendSSE  } = require('./streamEvents');

const awaitingMess = [];
const commandResult = {
	create: 'Created',
	start: 'Started',
	stop: 'Stopped',
	remove: 'Removed',
}


const sendingMessage = (message) => {
	if(sendSSE.message) {
		sendSSE.message(message);
		return; 
	} 

	awaitingSending(message);
}

const createMessReceived = (message) => {
	const command = toUppersCaseFirsLetter(message.command);
	const textMessage = `Received "${command} command"`
	const time = new Date();

	const fullmessage = {
		text: textMessage,
		idServer: message.idServer,
		time
	}
	return fullmessage;
}

const createMessResult = (result) => {
	const command = result.command;
	
	const textMessage = commandResult[command];
	const time = new Date();

	const fullmessage = {
		text: textMessage,
		idServer: result.data.idServer,
		time
	}

	return fullmessage;
}

const parseMessage = (mess) => {
	const messageJSON = mess.toString();
	if(!messageJSON) {
		return;
	}
	const messageObj = JSON.parse(messageJSON)

	if(messageObj?.command === 'create') {
		messageObj.idServer = uuid.v4();
	}

	return messageObj;
}

const toUppersCaseFirsLetter = (word) => {
	const newWord = typeof word === 'string' ?  
		word[0].toUpperCase() + word.slice(1, word.length) : 
		'Empty';

	return newWord;
}

const awaitingSending = (mess) => {
	const newMess = {
		message: mess,
		timer: null,
	}

	newMess.timer = setInterval((newMess) => {
		if(sendSSE.message) {	
			sendSSE.message(newMess.message);
			clearInterval(newMess.timer);
		
			const index = awaitingMess.indexOf(newMess);
			awaitingMess.splice(index, 1);
		}
	}, 5000, newMess);

	awaitingMess.push(newMess);
}

module.exports = {
	createMessReceived,
	createMessResult,
	parseMessage,
	sendingMessage,
	awaitingSending
} 