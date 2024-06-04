const uuid = require('uuid');
const fs = require('fs/promises');
const path = require('path');

const instancesFile = path.resolve(__dirname, '../data/instances.json');
const {	sendingMessage } = require('./notification');

const activeRequest = []; 


const parsingReq = async (req) => {	
	const isAvailableReq = chekAvailableReq(req);

	if(!isAvailableReq) {
		return;
	}

	addActiveRequest(req);

	return new Promise((res, rej) => {
		setTimeout(async (req) => {
			const command = req.command;
			const id = req.idServer;

			const message = {
				success: false,
				data: {
					idServer: null,
				},
				command,
			}	

			switch(command) {
				case 'create':
					const newInst = await createInstance(id);
					if(newInst) {
						message.data.idServer = newInst.idServer;
						message.data.state = "stopped"
						message.success = true;
					}
					break;

				case 'start':
					if(await startInstance(id)) {
						message.data.idServer = id;
						message.success = true;
					}
					break;

				case 'stop':
					if(await stopInstance(id)) {
						message.data.idServer = id;
						message.success = true;
					}
					break

				case 'remove':
					const removedInst = await removeInstance(id);
					if(removedInst) {
						message.data.idServer = removedInst.idServer;
						message.success = true;
					}
					break;
			}
			
			deleteActiveRequest(req)
			
			res(message)
		}, 20000, req)
	})
} 

const chekAvailableReq = (req) => {
	const command = req.command;
	const id = req.idServer;

	if(command === 'create') {
		return true;
	}

	if(command === 'remove') {
		const existRemoveReq = chekRemoveReq(id);
		if(existRemoveReq) {
			return false;
		}
		return true;
	}
	
	if(command === 'stop' || command === 'start') {
		const existAnyReq = chekAnyReq(id);
		if(existAnyReq) {
			return false;
		}
		return true;
	}
}

const chekRemoveReq = (id) => {
	const index = activeRequest.findIndex(item => {
		if(item.idServer === id && item.command === 'remove') {
			return true;
		}
		return false;
	})

	if(index > -1) {
		return true;
	}

	return false;
}

const chekAnyReq = (id) => {
	const index = activeRequest.findIndex(item => {
		if(item.idServer === id) {
			return true;
		}
		return false;
	})

	if(index > -1) {
		return true;
	}

	return false;
}

const createInstance = async (idServer) => {	
	try {
		const instances = await readInstances();
		const newInst = {
			state: 'stopped',
			idServer,
		}
		instances.push(newInst);
		await writeInstances(instances);

		return newInst;

	} catch (err) {
		console.log(`Что-то пошло не так ${err}`);
		return false;
	}
}

const removeInstance = async (id) => {
	try {
		const instances = await readInstances();
		const index = instances.findIndex(item => item.idServer === id);
		const removedInst = instances.splice(index, 1);
		await writeInstances(instances);

		return removedInst[0];

	} catch (err) {
		console.log(`Что-то пошло не так ${err}`);
		return false;
	}
}

const startInstance = async (id) => {
	try {
		const instances = await readInstances();
		const reqInst = instances.find(item => item.idServer === id);
		reqInst.state = 'running';

		await writeInstances(instances);

		return true;
	
	} catch (err) {
		console.log(`Что-то пошло не так ${err}`);
		return false;
	}
}

const stopInstance = async (id) => {
	try {
		const instances = await readInstances();
		const reqInst = instances.find(item => item.idServer === id);
		reqInst.state = 'stopped';

		await writeInstances(instances);

		return true;
	
	} catch (err) {
		console.log(`Что-то пошло не так ${err}`);
		return false;
	}
}

const addActiveRequest = (req) => {
	activeRequest.push(req)
}

const deleteActiveRequest = (req) => {
	const index = activeRequest.indexOf(req);
	if(index > -1) {
		activeRequest.splice(index, 1);
	}
}

const writeInstances = async (instances) => {
	try {
		const instancesJSON = instances ?
		JSON.stringify(instances) :
		[];

		await fs.writeFile(instancesFile, instancesJSON);
	} catch(err) {
		console.log(`Что-то пошло не так: ${err}`);
		return false;
	}
}
	
const readInstances = async () => {
	try{
		const instancesJSON = await fs.readFile(instancesFile, 'utf8');
		const instances = instancesJSON ? 
			JSON.parse(instancesJSON) :
			[];
		return instances;	
	} catch(err) {
		console.log(`Что-то пошло не так: ${err}`);
		return false;
	}
}

const loadInstances = async (command) => {
	const data = await readInstances();
	const instances = {
		success: true,
		command,
		data,
	}
	const instancesJSON = JSON.stringify(instances);
		return instancesJSON;
}


module.exports = {
	parsingReq,
	loadInstances
}

