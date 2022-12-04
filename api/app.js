import * as http from 'node:http'
import { xml2json } from 'xml-js'
import safeJSON from '../src/utils.js'
import defaultHandler from '../src/defaultHandler.js'
import helpers from '../src/helpers.js'
import router, { basePath } from '../src/router.js'

const processedContentTypes = {
  'text/html': (text) => text,
  'text/plain': (text) => text,
  'application/json': (json) => safeJSON(json, {}),
  'application/x-www-form-urlencoded': (data) => {
    return Object.fromEntries(new URLSearchParams(data))
  },
  'text/xml': (xml) => {
    return xml2json(xml, { spaces: 2, compact: true })
  },
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || basePath, `https://${req.headers.host}`)

  const routerModule = router.get(url.pathname) ?? {}

  const handler = routerModule[req?.method] ?? defaultHandler

  let payload = {}
  let rawRequest = ''

  for await (const chunk of req) {
    rawRequest += chunk
  }

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

server.on('clientError', (error, socket) => {
  if (error) console.log(error)

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
