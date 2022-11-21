import * as http from 'node:http'
import safeJSON from '../src/utils.js'
import defaultHandler from '../src/defaultHandler.js'
import helpers from '../src/helpers.js'
import router from '../src/router.js'

const processedContentTypes = {
  'text/html': (text) => text,
  'text/plain': (text) => text,
  'application/json': (json) => safeJSON(json, {}),
  'application/x-www-form-urlencoded': (data) => {
    return Object.fromEntries(new URLSearchParams(data))
  },
}

const server = http.createServer(async (req, res) => {
  // console.log(req.headers, 'req headers');
  const url = new URL(req.url || '/', `https://${req.headers.host}`)
  // console.log(url);
  // console.log(router.get(url.pathname), 'pathname');
  const routerModule = router.get(url.pathname) ?? {}
  // console.log(routerModule[req?.method], 'module method');
  const handler = routerModule[req?.method] ?? defaultHandler

  let payload = {}
  let rawRequest = ''

  for await (const chunk of req) {
    rawRequest += chunk
  }
  console.log(rawRequest, 'rawreq')
  if (req.headers['content-type']) {
    const contentType = req.headers['content-type'].split(';')[0]
    if (processedContentTypes[contentType]) {
      payload = processedContentTypes[contentType](rawRequest)
    }
  }

  try {
    handler(req, Object.assign(res, helpers), url, payload, rawRequest)
  } catch (e) {
    res.statusCode = 500
    res.end(process.env.NODE_ENV === 'production' ? 'internal error' : e)
  }
})

server.on('clientError', (_error, socket) => {
  socket.end('HTTP/1.1 400 bad request\r\n\r\n')
})

server.listen(parseInt(process.env.PORT) || 8000)

process.on('SIGINT', () => {
  server.close((error) => {
    if (error) {
      console.log(error)
      // eslint-disable-next-line n/no-process-exit
      process.exit(1)
    }
  })
})
