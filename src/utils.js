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

export function promisify(func: Function, boundObject: ?Object): Function {
  return (...args): Promise =>
    new Promise((resolve: Function, reject: Function) => {
      // Workaround because reject/resolve does not work in node-rfc environment
      let rejectError: ?any = null
      let resolveValues: ?Array = null
      const checkReturn: Function = () => {
        // Anything returned so far?
        let handled: boolean = false
        if (rejectError) {
          reject(rejectError)
          handled = true
        } else if (resolveValues) {
          resolve(resolveValues)
          handled = true
        }

        // Recheck in the future?
        if (!handled) {
          setTimeout(checkReturn, 10)
        }
      }
      setTimeout(checkReturn, 10)

      // Create the last argument: the generic callback function
      const callback: Function = (error: ?any, ...values) => {
        if (error) {
          rejectError = error
          // reject(error)
        } else {
          resolveValues = values
          // resolve(values)
        }
      }
      args.push(callback)

      // Call function
      setTimeout(() => {
        try {
          if (boundObject) {
            func.bind(boundObject)(...args)
          } else {
            func(...args)
          }
        } catch (error) {
          rejectError = error
        }
      }, 0)
    })
}

export function pad(
  input: string | number,
  length: number,
  character: string = ' ',
): string {
  return (Array(length).join(character) + input.toString()).slice(-1 * length)
}

export function makeLoggable(object: Object): Object {
  const log: Function = function log(
    tag: string | Array<string>,
    data: string,
    details: ?any,
  ) {
    if (this.logger) {
      const scope: string = this.name || this.constructor.name
      const tags: Array = Array.isArray(tag)
        ? [scope].concat(tag)
        : [scope, tag]
      this.logger(tags, data)

      if (details) {
        this.logger(tags, details)
      }
    }
  }

  // Add log function to class and prototype
  Object.assign(object, {
    log,
  })
  Object.assign(object.prototype, {
    log,
  })

  return object
}

export function isFunction(object: any): boolean {
  return !!(object && object.constructor && object.call && object.apply)
}

export function findByPath(object: Object, path: string): any {
  const parts: Array<string> = path.trim() === '' ? [] : path.split('.')
  let value: ?any = object
  while (value && parts.length > 0) {
    value = value[parts.shift()]
  }
  return value
}

export function removeUndefinedValues(object: Object): Object {
  const copy: Object = Object.assign({}, object)
  Object.keys(copy).forEach((key: any) => {
    if (copy[key] === undefined) {
      delete copy[key]
    }
  })

  return copy
}

export function isListed(list: Array, searchValue: string): boolean {
  return list.some(
    (value: string): boolean =>
      !!searchValue.match(new RegExp(`^${value.split('*').join('(.*)')}$`)),
  )
}
