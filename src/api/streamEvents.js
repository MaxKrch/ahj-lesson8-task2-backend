const uuid = require('uuid');
const { streamEvents } = require('http-event-stream');

const clients = [];
const sendSSE = {
	message: null,
}

const serverStreamEvents = async (ctx) => {
	streamEvents(ctx.req, ctx.res, {
		async fetch(lastEventId) {
			return [];
		},
		stream(sse) {
			clients.push(sse);

			const sendMessage = (message) => {
				const messageJSON = JSON.stringify(message);
				const id = uuid.v4();
				clients.forEach(item => {
					item.sendEvent({
						data: messageJSON,
						id,
					});
				})
			}

			saveInterfaceSSE(sendMessage);

			console.log('sse started');

			return (sse) => { 
				const index = clients.indexOf(sse);
				if(index > -1) {
					clients.splice(index, 1);
					console.log(`Client ${sse} disconnect`, clients);
				}
				
			}
		}
	});

	ctx.respond = false;
}

const saveInterfaceSSE = (sendMessage) => {
	sendSSE.message = sendMessage;
}

module.exports = {
	serverStreamEvents,
	sendSSE 
}