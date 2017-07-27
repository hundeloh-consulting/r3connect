import _Client from './lib/Client'
import _Configuration from './lib/Configuration'
import _Pool from './lib/Pool'
import _Server from './lib/Server'

const r3connect: Object = {
  Client: _Client,
  Configuration: _Configuration,
  Pool: _Pool,
  Server: _Server,
}

export default r3connect
export const Client = _Client
export const Configuration = _Configuration
export const Server = _Server
export const Pool = _Pool
module.exports = r3connect
