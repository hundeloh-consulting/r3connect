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
import Client from './Client'
import Pool from './Pool'

class MockClient extends Client {
  static connect(configuration: Object, release: Function): Promise {
    return new Promise((resolve: Function, reject: Function) => {
      if (configuration.fail) {
        setTimeout(() => reject(new Error('Failed')), 0)
      } else {
        setTimeout(() => resolve(new MockClient({}, release)), 0)
      }
    })
  }

  // eslint-disable-next-line class-methods-use-this
  invoke(): Promise {
    return new Promise((resolve: Function) => {
      resolve(
        {
          ev_result: 'result',
        },
        0,
      )
    })
  }

  // eslint-disable-next-line class-methods-use-this
  ping(): boolean {
    return true
  }

  // eslint-disable-next-line class-methods-use-this
  close(): boolean {
    return true
  }
}
Object.defineProperty(Pool, 'Client', {
  get: (): Object => MockClient,
})

describe('Pool', () => {
  describe('General', () => {
    it('is a class/function', () => {
      expect(Pool).to.be.a('function')
    })
  })

  describe('generateHash', () => {
    it('returns a string for a given object', () => {
      const configuration: Object = { dummy: 'a1' }
      expect(Pool.generateHash(configuration)).to.be.a('string')
    })

    it('returns the same hash for the same object', () => {
      const configurationA: Object = { dummy: '1' }
      const configurationB: Object = { dummy: '1' }
      expect(Pool.generateHash(configurationA)).to.equals(
        Pool.generateHash(configurationB),
      )
    })
  })

  describe('get', () => {
    it('returns an pool', () => {
      const configuration: Object = { dummy: 'a1' }
      expect(Pool.get(configuration)).to.be.a('Object')
    })

    it('returns the same pool for the same configuration', () => {
      const configurationA: Object = { dummy: '1' }
      const configurationB: Object = { dummy: '1' }

      expect(Pool.get(configurationA)).to.deep.equals(Pool.get(configurationB))
    })

    it('returns a pool that can be acquired', () => {
      const configurationA: Object = { dummy: '1' }

      expect(Pool.get(configurationA).acquire).to.be.a('Function')
    })

    it('acquired connection returns a client', (done: Function) => {
      const configurationA: Object = { dummy: '1' }

      Pool.get(configurationA)
        .acquire()
        .then((client: Object) => {
          Pool.get(configurationA).release(client)
          expect(client.constructor).to.deep.equals(Pool.Client)
          done()
        })
        .catch((error: Error) => {
          done(error)
        })
    })

    it('acquired connection returns a client with a promisfied invoke function', (
      done: Function,
    ) => {
      const configurationA: Object = { dummy: '1' }

      Pool.get(configurationA)
        .acquire()
        .then((client: Object) => {
          Pool.get(configurationA).release(client)
          expect(client.invoke).to.be.a('Function')
          expect(client.invoke()).to.be.a.instanceof(Promise)
          done()
        })
        .catch((error: Error) => {
          done(error)
        })
    })

    it('invoke function releases client automatically', (done: Function) => {
      const configurationA: Object = { dummy: '1' }

      Pool.get(configurationA)
        .acquire()
        .then((client: Object): Promise => client.invoke())
        .then((result: Object) => {
          expect(result).to.be.a('Object').and.to.deep.equals({
            ev_result: 'result',
          })
          done()
        })
        .catch((error: Error) => {
          done(error)
        })
    })
  })
})
