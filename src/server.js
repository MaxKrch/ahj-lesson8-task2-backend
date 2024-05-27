const http = require('http');
const Koa = require('koa');

const app = new Koa();


app.use(async (ctx) => {
	ctx.response.body = 'Ok';
})

const port = process.env.PORT || 7070;
const server = http.createServer(app.callback());