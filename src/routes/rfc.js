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

import Joi from 'joi'
import Pool from './../lib/Pool'
import { HttpException } from './../lib/Exceptions'
import { isListed } from './../utils'

export default [
  // Invoke RFC
  {
    method: 'POST',
    path: '/rfc/{functionModule}',
    config: {
      description: 'Invoke RFC',
      notes: 'Invokes a function module in the back-end',
      tags: ['api'],
      validate: {
        params: {
          functionModule: Joi.string().regex(/^[0-9a-zA-Z/_]+$/),
        },

        payload: {
          connection: Joi.string().token().optional().example('XYZ'),
          username: Joi.string().token().max(12).optional().example('DDIC'),
          password: Joi.string().max(40).optional().example('11920706'),
          applicationServer: Joi.string()
            .required()
            .example('gateway.example.corp'),
          instanceNumber: Joi.number()
            .integer()
            .min(0)
            .max(99)
            .required()
            .example(1),
          client: Joi.number()
            .integer()
            .min(0)
            .max(999)
            .required()
            .example(100),
          router: Joi.string().default('').allow(''),
          mysapsso2: Joi.string().default('').allow(''),
          parameters: Joi.object().default({}).example(
            JSON.stringify({
              iv_input: 'example',
            }),
          ),
        },
      },
    },
    handler: (request: Object, reply: Function) => {
      const functionModule: string = request.params.functionModule

      // Get configuration for connection (also if the passed connection is undefined)
      const connections: Object = request.config.get('connections')
      const connection: ?Object = connections[request.payload.connection]

      // Proceed only if the provided connection exists
      if (request.payload.connection && !connection) {
        return reply.error(
          new HttpException('The connection you provided is invalid.'),
        )
      }

      // Check if the function module is black/white listed
      const whitelisted: boolean = isListed(
        connection.functionModules.whitelist,
        functionModule,
      )
      if (!whitelisted) {
        const blacklisted: boolean = isListed(
          connection.functionModules.blacklist,
          functionModule,
        )
        if (blacklisted) {
          return reply.error(
            new HttpException(
              `The function module "${functionModule}" is blacklisted.`,
            ),
          )
        }
      }

      // Create configuration
      const configuration: Object = {
        applicationServer:
          connection.applicationServer || request.payload.applicationServer,
        instanceNumber:
          connection.instanceNumber || request.payload.instanceNumber,
        client: connection.client || request.payload.client,
        router: connection.router || request.payload.router,
      }

      // Add credentials (either SSO2 cookie or user/password)
      if (request.payload.mysapsso2 || request.state.MYSAPSSO2) {
        // Use connection.MYSAPSSO2 because it will allow to disable cookies via configuration (via mysapsso2 = null)
        configuration.mysapsso2 =
          connection.mysapsso2 ||
          request.payload.mysapsso2 ||
          request.state.MYSAPSSO2
      } else {
        configuration.username = connection.username || request.payload.username
        configuration.password = connection.password || request.payload.password
      }

      // Acquire connection from pool and invoke RFC
      const parameters: Object = request.payload.parameters
      Pool.get(configuration, request.log.bind(request))
        .acquire()
        .then((client: Object): Promise =>
          client.invoke(functionModule, parameters),
        )
        .then(([result: Object, meta: Object]) => {
          // Reply with result but as well metadata that was gathered
          reply({
            result,
            meta,
          })
        })
        .catch((error: Error) => {
          reply.error(error)
        })

      return null
    },
  },
]
