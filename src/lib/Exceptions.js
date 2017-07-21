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

import ErrorSubclass from 'error-subclass'

export class HttpException extends ErrorSubclass {
  context: ?Object = null

  constructor(
    message: ?string,
    statusCode: ?number = 400,
    code: ?string,
    context: ?Object,
  ) {
    super(message)
    this.statusCode = statusCode
    this.code = code
    this.context = context
  }
}

export class RFCException extends HttpException {
  client: ?Object = null

  constructor(
    message: ?string,
    statusCode: ?number,
    code: ?string,
    context: ?Object,
    client: ?Object,
  ) {
    super(message, statusCode, code, context)
    this.client = client
  }

  static parse(error: Error, context: ?Object, client: ?Object): Object {
    const key: ?string = error.key
    let message: ?string = null

    // Translate code to message
    const code: number = parseInt(error.code, 10)
    switch (code) {
      case 1: {
        const parsedMessage: Object = this.parseMessage(error.message)
        const prefix: string = parsedMessage['ERRNO TEXT']
          ? `${parsedMessage['ERRNO TEXT']}: `
          : ''
        message = `${prefix}${parsedMessage.ERROR}`
        break
      }

      default: {
        message = error.message
      }
    }

    // Return result
    let result: ?Error = null
    if (this === RFCException) {
      result = new this(message, 502, key, context, client)
    } else {
      result = new this(message, context, client)
    }
    return result
  }

  static parseMessage(message: string = ''): Object {
    const result: Object = {}
    message
      .split('\n')
      .map((line: string): string => line.trim())
      .forEach((line: string) => {
        const key: string = line.substring(0, 12).trim()
        const value: string = line.substring(12).trim()
        if (key) {
          result[key] = value
        }
      })
    return result
  }
}

export class LogonException extends RFCException {
  constructor(message: string, context: ?Object) {
    super(message, 403, 'RFC_LOGON_FAILURE', context)
  }
}

export class TimeoutException extends HttpException {
  client: ?Object = null

  constructor(message: string, context: ?Object, client: ?Object) {
    super(message, 504, 'RFC_TIMEOUT', context)
    this.client = client
  }
}
