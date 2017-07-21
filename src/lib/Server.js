/*
    r3connect
    Copyright (C) 2017 Julian Hundeloh

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published
    by the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

import 'source-map-support/register'
import Hapi from 'hapi'
import Good from 'good'
import HapiBoomDecorators from 'hapi-boom-decorators'
import { HttpException } from './Exceptions'
import Pool from './Pool'
import routes from './../routes/'
import { promisify } from './../utils'

export default class Server {
  server: ?Object = null
  config: ?Object = null

  constructor(config: ?Object) {
    this.config = config
    this.server = this.createServer()
  }

  createServer() {
    // Create server
    const server: Object = new Hapi.Server({
      debug: {
        request: [
          'error',
          process.env.NODE_ENV === 'development' ? 'debug' : null,
        ].filter(Boolean),
      },
    })
    server.connection(this.config.get('server'))

    // Add routes
    routes.forEach((route: Object) => server.route(route))

    return server
  }

  start(): Promise {
    // Register plugins and start the server
    return promisify(this.server.register, this.server)([
      {
        register: Good,
        options: {
          ops: {
            interval: 30000,
          },
          reporters: {
            console: [
              {
                module: 'good-squeeze',
                name: 'Squeeze',
                args: [
                  {
                    request: this.config.get('logs.tags'),
                    log: this.config.get('logs.tags'),
                    ops: '*',
                  },
                ],
              },
              {
                module: 'good-console',
              },
              'stdout',
            ],
            file: [
              {
                module: 'good-squeeze',
                name: 'Squeeze',
                args: [
                  {
                    log: this.config.get('logs.tags'),
                    ops: '*',
                  },
                ],
              },
              {
                module: 'good-squeeze',
                name: 'SafeJson',
              },
              {
                module: 'good-file',
                args: ['./logs/log'],
              },
            ],
          },
        },
      },
      {
        register: HapiBoomDecorators,
      },
    ])
      .then(() => {
        // Error handling
        this.server.decorate('reply', 'error', function replyWithError(
          error: Error,
        ) {
          if (error instanceof HttpException) {
            const data: Object = Object.assign(
              {
                code: error.code,
              },
              error.context,
            )
            this.boom(error.statusCode, error.message, data)
          } else {
            this(error)
          }
        })
        this.server.ext('onPreResponse', (request: Object, reply: Function) => {
          const response: Object = request.response

          if (!response.isBoom) {
            reply.continue()
          } else {
            // Output details of errors
            response.output.payload.data = response.data
              ? response.data
              : undefined
            request.log(['error'], response)
            reply(response)
          }
        })

        // Provide configuration in requests
        this.server.decorate('request', 'config', this.config)

        // Start server
        return promisify(this.server.start, this.server)()
      })
      .then(() => {
        // Set loggers
        this.config.logger = this.server.log.bind(this.server)
        Pool.logger = this.server.log.bind(this.server)

        // Let's go
        this.server.log(['debug'], `Server running at: ${this.server.info.uri}`)
      })
  }
}
