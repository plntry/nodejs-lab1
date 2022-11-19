import * as http from 'node:http'
import defaultHandler from './defaultHandler.js'
import helpers from './helpers.js'
import router from './router.js'

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || '/', `https://${req.headers.host}`)
  const routerModule = router.get(url.pathname) ?? {}
  const handler = routerModule[req?.method] ?? defaultHandler

  handler(req, Object.assign(res, helpers), url)
})

server.on('clientError', (_error, socket) => {
  socket.end('HTTP/1.1 400 bad request\r\n\r\n')
})

server.listen(parseInt(process.env.PORT) || 8000)

process.on('SIGINT', () => {
  server.close((error) => {
    if (error) {
      // console.log(error)
      // process.exit(1)
      throw new Error(error)
    }
  })
})
