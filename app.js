const Koa = require('koa')
const app = new Koa()

const connect = require('./middleware/connect')
const session = require('./middleware/sess')
const router = require('./middleware/router')
const db = require('./middleware/database')
const wss = require('./websocket/websocket')

connect(app)
session(app)
router(app)
db(app)

let server = app.listen(3000)

wss(server)