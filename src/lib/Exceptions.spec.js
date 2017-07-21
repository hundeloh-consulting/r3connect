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
import {
  HttpException,
  LogonException,
  RFCException,
  TimeoutException,
} from './Exceptions'

describe('Exceptions', () => {
  describe('HttpException', () => {
    it('is a class/function', () => {
      expect(HttpException).to.be.a('function')
    })
  })

  describe('RFCException', () => {
    it('is a class/function', () => {
      expect(RFCException).to.be.a('function')
    })

    describe('parseMessage', () => {
      it('is a function', () => {
        expect(RFCException.parseMessage).to.be.a('function')
      })

      it('returns an key/value object', () => {
        const message: string = `
            LOCATION    CPIC (TCP/IP) on local host 7cd9c0b0e199 with Unicode
            ERROR       partner '127.0.0.1:3300' not reached
            TIME        Thu Jul 17 14:00:43 2017
        `
        expect(RFCException.parseMessage(message)).to.be
          .a('Object')
          .and.deep.equal({
            LOCATION: 'CPIC (TCP/IP) on local host 7cd9c0b0e199 with Unicode',
            ERROR: "partner '127.0.0.1:3300' not reached",
            TIME: 'Thu Jul 17 14:00:43 2017',
          })
      })
    })
  })

  describe('LogonException', () => {
    it('is a class/function', () => {
      expect(LogonException).to.be.a('function')
    })
  })

  describe('TimeoutException', () => {
    it('is a class/function', () => {
      expect(TimeoutException).to.be.a('function')
    })
  })
})
