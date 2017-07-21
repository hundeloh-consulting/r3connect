const fs = require('fs')
const path = require('path')

module.exports = {
  server: {
    host: '0.0.0.0',
    port: process.env.R3CONNECT_PORT || 3001,
    routes: {
      cors: true
    },
    tls: {
      // Self signed certificates for "localhost"
      key: fs.readFileSync(path.join(__dirname, 'tls', 'key.pem')),
      cert: fs.readFileSync(path.join(__dirname, 'tls', 'cert.pem'))
    }
  },
  logs: {
    // Tags that are logged in console and files
    tags: [
      'error',
      'debug'
    ]
  },
  connections: {
    // In case no connection is provided, all function modules are white listed by default
    undefined: {
      functionModules: {
        whitelist: ['*'],
        blacklist: []
      }
    }
  }
}
