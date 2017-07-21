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

// eslint-disable-next-line import/no-extraneous-dependencies
import { describe, it } from 'mocha'
// eslint-disable-next-line import/no-extraneous-dependencies
import { expect } from 'chai'
import * as utils from './utils'

describe('Utils', () => {
  describe('promisify', () => {
    it('is a function', () => {
      expect(utils.promisify).to.be.a('function')
    })

    it('returns a function', () => {
      const mockFunction: Function = (callback: Function) => {
        callback()
      }
      expect(utils.promisify(mockFunction)).to.be.a('function')
    })

    it('returns positively', (done: Function) => {
      const mockFunction: Function = (callback: Function) => {
        callback(null, 'Positive')
      }

      utils.promisify(mockFunction)().then((result: any) => {
        expect(result).to.be.a('array').and.deep.equal(['Positive'])
        done()
      })
    })

    it('returns positively with a parameter', (done: Function) => {
      const mockFunction: Function = (
        parameter: string,
        callback: Function,
      ) => {
        callback(null, parameter)
      }

      utils.promisify(mockFunction)('testParameter').then((result: any) => {
        expect(result).to.be.a('array').and.deep.equal(['testParameter'])
        done()
      })
    })

    it('returns positively with multiple parameters', (done: Function) => {
      const mockFunction: Function = (
        p1: string,
        p2: string,
        p3: string,
        cb: Function,
      ) => {
        cb(null, p1, p2, p3)
      }

      utils.promisify(mockFunction)(
        'testParameter1',
        'testParameter2',
        'testParameter3',
      ).then((args: any) => {
        expect(args).to.be
          .a('array')
          .and.deep.equal([
            'testParameter1',
            'testParameter2',
            'testParameter3',
          ])
        done()
      })
    })

    it('returns negatively with an Error', (done: Function) => {
      const mockFunction: Function = (callback: Function) => {
        callback(new Error('Negatively'))
      }

      utils.promisify(mockFunction)().catch((error: any) => {
        expect(error).to.be.a('Error')
        done()
      })
    })

    it('returns negatively with a string', (done: Function) => {
      const mockFunction: Function = (callback: Function) => {
        callback('Negatively')
      }

      utils.promisify(mockFunction)().catch((error: any) => {
        expect(error).to.be.a('string').and.equal('Negatively')
        done()
      })
    })
  })

  describe('pad', () => {
    it('is a function', () => {
      expect(utils.pad).to.be.a('function')
    })

    it('fills up the value with spaces by default', () => {
      expect(utils.pad('X', 5)).to.be.a('string').and.deep.equal('    X')
    })

    it('fills up the value with any character', () => {
      expect(utils.pad('X', 5, '1')).to.be.a('string').and.deep.equal('1111X')
    })

    it('fills up the value with any string', () => {
      expect(utils.pad('X', 5, '12')).to.be.a('string').and.deep.equal('1212X')
    })
  })

  describe('loggable', () => {
    it('is a function', () => {
      expect(utils.makeLoggable).to.be.a('function')
    })

    it('extends object with a log function', () => {
      expect(utils.makeLoggable(class Test {}).log).to.be.a('function')
    })

    it('extends prototype object with a log function', () => {
      expect(utils.makeLoggable(class Test {}).prototype.log).to.be.a(
        'function',
      )
    })
  })

  describe('isFunction', () => {
    it('is a function', () => {
      expect(utils.isFunction).to.be.a('function')
    })

    it('returns true for a function', () => {
      expect(utils.isFunction(() => {})).to.equal(true)
    })

    it('returns false for a string', () => {
      expect(utils.isFunction('test')).to.equal(false)
    })

    it('returns false for a plain object', () => {
      expect(utils.isFunction({})).to.equal(false)
    })
  })

  describe('findByPath', () => {
    it('is a function', () => {
      expect(utils.findByPath).to.be.a('function')
    })

    it('returns correct value for path', () => {
      const object: Object = {
        a: {
          b: ['c'],
        },
      }
      expect(utils.findByPath(object, 'a.b')).to.deep.equal(object.a.b)
    })

    it('returns correct value for path', () => {
      const object: Object = {
        a: {
          b: ['c'],
        },
      }
      expect(utils.findByPath(object, 'a.c')).to.equal(undefined)
    })

    it('returns full object for empty path', () => {
      const object: Object = {
        a: {
          b: ['c'],
        },
      }
      expect(utils.findByPath(object, '')).to.deep.equal(object)
    })
  })

  describe('removeUndefinedValues', () => {
    it('is a function', () => {
      expect(utils.removeUndefinedValues).to.be.a('function')
    })

    it('removes undefined values from object', () => {
      const object: Object = {
        a: '1',
        b: undefined,
        c: '3',
      }
      expect(utils.removeUndefinedValues(object)).to.deep.equal({
        a: '1',
        c: '3',
      })
    })
  })

  describe('isListed', () => {
    it('is a function', () => {
      expect(utils.isListed).to.be.a('function')
    })

    it('returns true if the exact value is found', () => {
      const list: Array = ['a', 'b', 'c']
      expect(utils.isListed(list, 'b')).to.equal(true)
    })

    it('returns true if the value is listed via a (simple) pattern', () => {
      const list: Array = ['aa', 'b*', 'cc']
      expect(utils.isListed(list, 'btest')).to.equal(true)
    })

    it('returns false if the value is not listed', () => {
      const list: Array = ['aa', 'bb', 'cc']
      expect(utils.isListed(list, 'dd')).to.equal(false)
    })
  })
})
