function GET(req, res) {
  res.json({ text: 'test get' })
}

function OPTIONS(req, res) {
  res.json({ text: 'test options' })
}

function POST(req, res) {
  res.json({ text: 'test post' })
}

export { GET, OPTIONS, POST }
