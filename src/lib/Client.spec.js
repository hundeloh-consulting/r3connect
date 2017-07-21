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

class MockNodeRFC {
  configuration: ?Object = null

  constructor(configuration: Object) {
    this.configuration = configuration
  }

  connect(callback: Function) {
    if (this.configuration.user === 'FAIL') {
      setTimeout(() => callback(new Error('Failed')), 0)
    } else {
      const delay: number = this.configuration.user === 'DELAY' ? 50 : 0
      setTimeout(() => callback(), delay)
    }
  }

  // eslint-disable-next-line class-methods-use-this
  invoke(functionModule: string, parameters: ?Object, callback: Function) {
    if (functionModule === 'FAIL') {
      setTimeout(() => callback(new Error('Failed')), 0)
    } else {
      const delay: number = functionModule === 'DELAY' ? 50 : 0
      setTimeout(
        () =>
          callback(null, {
            ev_result: true,
          }),
        delay,
      )
    }
  }
}
Object.defineProperty(Client, 'NodeRFC', {
  get: (): Object => MockNodeRFC,
})
Object.defineProperty(Client, 'options', {
  get: (): Object => ({
    connectTimeout: 50,
    invokeTimeout: 50,
  }),
})
const defaultConfiguration: Object = {
  applicationServer: 'test',
  instanceNumber: 0,
  client: 1,
  router: 'router',
  username: 'username',
  password: '',
}

describe('Client', () => {
  describe('General', () => {
    it('is a class/function', () => {
      expect(Client).to.be.a('function')
    })
  })

  describe('connect', () => {
    it('returns a promise', () => {
      const configuration: Object = Object.assign({}, defaultConfiguration, {
        username: 'SUCCESS',
      })
      expect(Client.connect(configuration, () => {})).to.be.a('Promise')
    })

    it('returns an instance of itself if connection was successful', (
      done: Function,
    ) => {
      const configuration: Object = Object.assign({}, defaultConfiguration, {
        username: 'SUCCESS',
      })
      Client.connect(configuration, () => {})
        .then((client: Object) => {
          expect(client).to.be.instanceOf(Client)
          done()
        })
        .catch((error: Error) => {
          done(error)
        })
    })

    it('throws an error if connection was not successful', (done: Function) => {
      const configuration: Object = Object.assign({}, defaultConfiguration, {
        username: 'FAIL',
      })
      Client.connect(configuration, () => {})
        .then(() => {
          done(
            new Error(
              'Connect returned successful though it should have failed',
            ),
          )
        })
        .catch(() => {
          done()
        })
    })

    it('throws an error if connection attempt takes too long', (
      done: Function,
    ) => {
      const configuration: Object = Object.assign({}, defaultConfiguration, {
        username: 'DELAY',
      })
      Client.connect(configuration, () => {})
        .then(() => {
          done(new Error('Returned successful though it should have failed'))
        })
        .catch(() => {
          done()
        })
    })
  })

  describe('invoke', () => {
    it('returns a promise', (done: Function) => {
      const configuration: Object = Object.assign({}, defaultConfiguration)
      Client.connect(configuration, () => {})
        .then((client: Object) => {
          expect(client.invoke('SUCCESS')).to.be.a('Promise')
          done()
        })
        .catch((error: Error) => {
          done(error)
        })
    })

    it('returns the result if it was successful and release resource automatically', (
      done: Function,
    ) => {
      const configuration: Object = Object.assign({}, defaultConfiguration, {
        username: 'SUCCESS',
      })
      let tempClient: ?Object = null
      Client.connect(configuration, () => {
        tempClient.released = true
      })
        .then((client: Object): Promise => {
          tempClient = client
          expect(tempClient.released).to.equals(undefined)
          return client.invoke('SUCCESS')
        })
        .then(([result: Object, meta: Object]) => {
          expect(result).to.be.a('Object').and.to.deep.equals({
            ev_result: true,
          })
          expect(meta).to.be.a('Object')
          expect(tempClient.released).to.equals(true)
          done()
        })
        .catch((error: Error) => {
          done(error)
        })
    })

    it('throws an error if it takes too long', (done: Function) => {
      const configuration: Object = Object.assign({}, defaultConfiguration, {
        username: 'SUCCESS',
      })
      Client.connect(configuration, () => {})
        .then((client: Object): Promise => client.invoke('DELAY'))
        .then(() => {
          done(new Error('Returned successful though it should have failed'))
        })
        .catch(() => {
          done()
        })
    })
  })
})
