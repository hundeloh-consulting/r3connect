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

import Pool2 from 'pool2'
import objectHash from 'object-hash'
import Client from './Client'
import { TimeoutException } from './Exceptions'
import { makeLoggable, promisify } from './../utils'

export default makeLoggable(
  class Pool {
    static logger: ?Function = null

    // Each destination has its own pool
    static pools: Object = {}

    static options: Object = {
      acquireTimeout: 24 * 60 * 60 * 1000,
      disposeTimeout: 30 * 1000,
      pingTimeout: 2 * 1000,
      idleTimeout: 120 * 1000,
      requestTimeout: Infinity,

      max: 1,
      min: 0,
      testOnBorrow: true,
      evictionRunIntervalMillis: 5 * 60 * 1000,
      maxRequests: Infinity,
      backoff: {
        min: 1 * 1000,
        max: 60 * 1000,
        jitter: 0,
      },
      bailAfter: 1,
      bailTimeout: 30 * 1000,
    }

    static Client: Object = Client

    static generateHash(configuration: Object): string {
      return objectHash(configuration)
    }

    static remove(configuration: Object) {
      const hash: string = this.generateHash(configuration)
      const pool: ?Object = this.pools[hash]

      if (pool) {
        pool.end()
        this.pools[hash] = undefined
        this.log(
          'debug',
          `Removed connection pool "${hash}" for host "${configuration.applicationServer}".`,
        )
      }
    }

    static create(configuration: Object, logger: ?Function): Object {
      let lastError: ?Error = null
      const pool: Object = new Pool2(
        Object.assign(
          {
            acquire: (callback: Function) => {
              this.log(
                'debug',
                `Start acquiring connection for "${configuration.applicationServer}".`,
              )

              try {
                const boundRelease: Function = pool.release.bind(pool)
                this.Client
                  .connect(configuration, boundRelease, logger)
                  .then((client: Object) => {
                    callback(null, client)
                  })
                  .catch((error: Error) => {
                    // Check if error occurred in a client
                    if (error.client) {
                      // Release client from pool so it doesn't block future requests
                      if (error.code && error.code.startsWith('RFC_')) {
                        pool.destroy(error.client)
                      } else {
                        pool.remove(error.client)
                      }
                    } else {
                      // If no connection could be established, remove the pool after some time
                      // Any requests before are served with a cached error
                      lastError = error
                      setTimeout(
                        () => Pool.remove(configuration),
                        this.options.bailTimeout,
                      )
                    }

                    callback(error)
                  })
              } catch (error) {
                callback(error)
              }
            },

            dispose: (client: Object, callback: Function) => {
              this.log(
                'debug',
                `Disposing connection for "${configuration.applicationServer}".`,
              )
              client.close()
              callback()
            },

            destroy: (client: Object, callback: Function) => {
              this.log(
                'debug',
                `Destroying connection for "${configuration.applicationServer}".`,
              )
              callback()
            },

            ping: (client: Object, callback: Function) => {
              // Asynchronously ping
              setTimeout(() => {
                if (client.ping()) {
                  callback()
                } else {
                  callback(
                    new TimeoutException(
                      `Ping to "${configuration.applicationServer}" failed.`,
                    ),
                  )
                }
              }, 0)
            },
          },
          this.options,
        ),
      )

      // Promisify acquire and return last error if present
      // Otherwise a generic error from pool2 would be thrown
      const originalAcquire: Function = pool.acquire.bind(pool)
      pool.acquire = function acquire(): Promise {
        return promisify(originalAcquire, pool)()
          .then(([client: Object]): Object => client)
          .catch((error: Error) => {
            throw lastError || error
          })
      }

      // Catch all generic errors
      pool.on('error', (error: Error) => {
        if (!error.code) {
          this.log(
            'error',
            `An error occured in pool "${configuration.applicationServer}".`,
            error,
          )
        }
      })

      return pool
    }

    static get(configuration: Object, logger: ?Function): Object {
      const hash: string = this.generateHash(configuration)
      let connection: ?Object = null

      // Reuse pool once it was created for a specific configuration
      if (this.pools[hash]) {
        connection = this.pools[hash]
        this.log(
          'debug',
          `Reuse connection pool "${hash}" of host "${configuration.applicationServer}".`,
        )
      } else {
        connection = this.create(configuration, logger)
        this.pools[hash] = connection
        this.log(
          'debug',
          `Added connection pool "${hash}" for host "${configuration.applicationServer}".`,
        )
      }

      return connection
    }
  },
)
