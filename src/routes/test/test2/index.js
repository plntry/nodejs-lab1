function GET(req, res) {
  res.json({ text: 'test 2 get' })
}

function OPTIONS(req, res) {
  res.json({ text: 'test 2 options' })
}

function POST(req, res) {
  res.json({ text: 'test 2 post' })
}

export { GET, OPTIONS, POST }
