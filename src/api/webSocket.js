const WS = require('ws');

const {	createMessReceived, createMessResult, parseMessage, sendingMessage } = require('./notification');
const { parsingReq, loadInstances } = require('./dataBase');

const createServer = (server) => {
	const wsServer = new WS.Server ({ server });

	const sendMess = (mess) => {
		const message = JSON.stringify(mess);
		[...wsServer.clients]
			.filter(item => item.readyState === WS.OPEN)
			.forEach(item => item.send(message));
	}

	wsServer.on('connection', async (ws, req) => {
	
		ws.on('message', async mess => {
			const messageObj = parseMessage(mess);

			if(messageObj.command === 'load') {
				const instances = await loadInstances(messageObj.command);
				ws.send(instances);
				return;
			}

			const messageReceived =	createMessReceived(messageObj);
			sendingMessage(messageReceived);

			const result = await parsingReq(messageObj)
			
			if(!result) {
				return;
			}

			sendMess(result);
			
			if(!result.success) {
				return;
			}	

			const messageResult = createMessResult(result)
			sendingMessage(messageResult);
		});

		ws.on('error', async err => {
			console.log(err)
		});

		ws.on('close', async event => {
			console.log(`Conection closed with code: ${event}`)
		});
	});
	return wsServer;
}



module.exports = {
	createServer,
}