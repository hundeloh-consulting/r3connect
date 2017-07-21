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
import Configuration from './Configuration'
import config from './../../config'

describe('Configuration', () => {
  describe('General', () => {
    it('is a class/function', () => {
      expect(Configuration).to.be.a('function')
    })
  })

  describe('default config.js', () => {
    it('passes validation', () => {
      expect(Configuration.validate(config)).to.equals(true)
    })
  })
})
