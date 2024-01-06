const fs = require('fs')
const http = require('http')

const port = process.argv[2] ?? 8000

http.createServer((req, res) => {
    fs.readFile(
        __dirname + '/build' + (req.url === '/' ? '/index.html' : req.url),
        (err, data) => {
            if (err) {
                res.writeHead(404)
                res.end(JSON.stringify(err))
            } else {
                res.statusCode = 200
                res.setHeader('Access-Control-Allow-Origin', '*')
                res.end(data)
            }
        }
    )
}).listen(port, () => console.log(`Listening localhost:${port}`))
