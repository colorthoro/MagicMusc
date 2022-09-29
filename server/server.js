const http = require('http')
http.createServer((req, res) => {
    console.log(req)
    res.write('abc')
    res.end()
}).listen(12345)
