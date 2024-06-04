const http = require('http');
const Koa = require('koa');
const { koaBody } = require('koa-body');
const cors = require('@koa/cors');
const Router = require('koa-router');

const { serverStreamEvents } = require('./api/streamEvents')
const { createServer } = require('./api/webSocket');


// const koaStatic = require('koa-static')


const app = new Koa();
const router = new Router();
app.use(cors())
	.use(koaBody({
		text: true,
	  urlencoded: true,
	  multipart: true,
	  json: true,
	}))

const test = (id) => {
  return {
    id,
  }
}

router.get('/sse', async (ctx) => {
	serverStreamEvents(ctx);
})

app.use(router.routes())
	.use(router.allowedMethods());

const port = process.env.PORT || 7070;
const server = http.createServer(app.callback());
const wsServer = createServer(server);

server.listen(port);