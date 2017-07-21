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

import { LogonException, RFCException, TimeoutException } from './Exceptions'
import { makeLoggable, pad, promisify, removeUndefinedValues } from './../utils'

export default makeLoggable(
  class Client {
    nodeRFC: ?Object = null
    release: ?Function = null
    logger: ?Function = null
    connectTime: ?number = null
    numberOfInvokes: number = 0


    static options: Object = {
      connectTimeout: 5 * 1000,
      invokeTimeout: 30 * 1000,
    }

    // Needs to be required as it could throw an exception if it was not built correctly
    static get NodeRFC(): Object {
      // eslint-disable-next-line global-require, import/no-unresolved
      return require('node-rfc').Client
    }

    constructor(nodeRFC: Object, release: Function) {
      this.nodeRFC = nodeRFC
      this.release = release
    }

    static connect(
      configuration: Object,
      release: Function,
      logger: ?Function,
    ): Promise {
      const nodeRFC: Object = new this.NodeRFC(
        removeUndefinedValues({
          ashost: configuration.applicationServer,
          sysnr: pad(configuration.instanceNumber, 2, '0'),
          client: pad(configuration.client, 3, '0'),
          saprouter: configuration.router,
          user: configuration.username,
          passwd: configuration.password,
          MYSAPSSO2: configuration.mysapsso2,
          trace: '0',
        }),
      )
      const connect: Function = nodeRFC.connect
      const startTime: Date = new Date()

      // Connect to system
      const connectPromise: Promise = promisify(connect, nodeRFC)
        .apply(nodeRFC)
        .then((): Object => {
          // Create client
          const client: Object = new Client(nodeRFC, release)
          client.logger = logger
          client.connectTime = new Date() - startTime
          return client
        })
        .catch((error: Error) => {
          throw LogonException.parse(
            error,
            Object.assign({}, configuration, { password: '********' }),
          )
        })

      // Prevent that a RFC runs forever
      const timeoutPromise: Promise = new Promise(
        (resolve: Function, reject: Function) => {
          setTimeout(() => {
            reject(
              new TimeoutException(
                `The system took too long to respond (more than ${this.options
                  .connectTimeout / 1000} seconds).`,
                Object.assign({}, configuration, { password: '********' }),
              ),
            )
          }, this.options.connectTimeout)
        },
      )

      // Whoever finishes first wins the race
      return Promise.race([connectPromise, timeoutPromise])
    }

    close(): boolean {
      return this.nodeRFC.close.apply(this.nodeRFC)
    }

    ping(): boolean {
      return this.nodeRFC.ping.apply(this.nodeRFC)
    }

    invoke(functionModule: string, parameters: ?Object): Promise {
      const invoke: Function = this.nodeRFC.invoke
      const startTime: Date = new Date()

      // Keep track of invokes
      this.numberOfInvokes = this.numberOfInvokes + 1

      // Call system
      const args: Array = [functionModule, parameters]
      const invokePromise: Promise = promisify(invoke, this.nodeRFC)
        .apply(this.nodeRFC, args)
        .catch((error: Error) => {
          throw RFCException.parse(error, this)
        })

      // Prevent that a RFC runs forever
      const timeoutPromise: Promise = new Promise(
        (resolve: Function, reject: Function) => {
          setTimeout(() => {
            reject(
              new TimeoutException(
                `The function call took too long to respond (more than ${this
                  .constructor.options.invokeTimeout / 1000} seconds).`,
                {
                  functionModule,
                },
                this,
              ),
            )
          }, this.constructor.options.invokeTimeout)
        },
      )

      // Whoever finishes first wins the race
      return Promise.race([invokePromise, timeoutPromise])
        .then(([result: Object]): Promise => {
          // Release resource
          this.release(this)

          // Add performance information
          return Promise.all([
            result,
            {
              invokeTime: new Date() - startTime,
              connectTime: this.numberOfInvokes === 1 ? this.connectTime : 0,
            },
          ])
        })
        .catch((error: Error) => {
          // Release resource
          this.release(this)

          // Pass on error
          throw error
        })
    }
  },
)
