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

import os from 'os'
import path from 'path'
import childProcess from 'child_process'
import chalk from 'chalk'
import fs from 'fs-extra'
import updateNotifier from 'update-notifier'
import pkg from './../package'
import { Client, Configuration, Server } from './index'

export default (requirex: Function) => {
  // Set color theme
  const logger: Object = {
    log: console.log,
    success: text => logger.log(chalk.bold.green(text)),
    info: text => logger.log(chalk.blue(text)),
    error: text => logger.log(chalk.bold.red(text)),
    warn: text => logger.log(chalk.yellow(text)),
  }

  // Helper function to load configuration from project folder
  const pathToFallbackConfig: string = path.join(__dirname, '..', 'config.js')
  const pathToConfig: string = path.join(process.cwd(), 'config.js')
  let config: ?Object = null
  function loadConfig(file) {
    let loadedConfig = null
    try {
      const content: string = fs.readFileSync(file, 'utf8')
      loadedConfig = eval(content)
    } catch (error) {
      loadedConfig = null
    }
    return loadedConfig
  }

  // Welcome
  logger.log(`
      ____                                  _   
      |___ \                                | |  
  _ __ __) | ___ ___  _ __  _ __   ___  ___| |_ 
  | '__|__ < / __/ _ \| '_ \| '_ \ / _ \/ __| __|
  | |  ___) | (_| (_) | | | | | | |  __/ (__| |_ 
  |_| |____/ \___\___/|_| |_|_| |_|\___|\___|\__|
  `)

  // Check for updates
  updateNotifier({ pkg }).notify()

  // Get package
  let project: ?Object = null
  try {
    project = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), 'package.json')),
    )
  } catch (error) {
    logger.error(
      'Please initiate this project as an npm package first by running "npm init".',
    )
    process.exit(0)
  }

  // Handle different commands
  const command: ?string = process.argv[2]
  switch (command) {
    case 'welcome': {
      logger.success('r3connect was successfully installed. Congratulations!')

      break
    }

    case 'init': {
      // Ensure that we do not override an existing configuration
      let configAlreadyExists: ?boolean = null
      try {
        fs.statSync(pathToConfig)
        configAlreadyExists = true
      } catch (error) {
        configAlreadyExists = false
      }

      if (configAlreadyExists) {
        logger.error(
          `It seems that there is already a configuration present ("${pathToConfig}"). Delete it before you try to initialize the project.`,
        )
        process.exit(0)
      } else {
        // Copy skeleton to project folder
        Promise.all([
          fs.copy(
            path.join(__dirname, '..', 'vendor'),
            path.join(process.cwd(), 'vendor'),
          ),
          fs.copy(
            path.join(__dirname, '..', 'tls'),
            path.join(process.cwd(), 'tls'),
          ),
          fs.copy(
            path.join(__dirname, '..', 'Dockerfile'),
            path.join(process.cwd(), 'Dockerfile'),
          ),
          fs.copy(
            path.join(__dirname, '..', 'config.js'),
            path.join(process.cwd(), 'config.js'),
          ),
        ])
          .then(() => {
            logger.success(
              'We initialized your project folder and you can start changing the configuration. Once you think you are ready, run "r3connect server" or "r3connect docker".',
            )
          })
          .catch(() => {
            logger.error(
              'We tried to initialize your project folder but for some reason it failed. Please check the permissions of the folder.',
            )
          })
      }

      break
    }

    case 'server':
    case 'docker': {
      // Configuration must be loaded both for Server and for Docker
      try {
        fs.statSync(pathToConfig)
      } catch (error) {
        logger.error(
          'We could not find a "config.js" file. Please ensure that you run "r3connect init" before you go on.',
        )
        process.exit(0)
      }
      config = new Configuration(
        loadConfig(pathToConfig),
        loadConfig(pathToFallbackConfig),
      )

      // Now differentiate between Server and Docker
      switch (command) {
        case 'server': {
          // Check if node-rfc is installed and assign to client for later usage
          try {
            const NodeRFC: Object = requirex(
              path.join(process.cwd(), 'node_modules', 'node-rfc'),
            )
            Object.defineProperty(Client, 'NodeRFC', {
              get: (): Object => NodeRFC.Client,
            })
          } catch (error) {
            const target: string = path.join(
              process.cwd(),
              'vendor',
              'nwrfcsdk',
            )
            const targetLib: string = path.join(target, 'lib')

            logger.error('For some reason "node-rfc" could not be loaded.')
            logger.info(
              'Please make sure that you download the SAP NW RFC Library from the SAP Service Marketplace and follow these steps:',
            )
            logger.log(`1. Unpack the downloaded archive to "${target}".`)
            logger.log(`2. Make sure that the directory "${targetLib}" exists.`)
            switch (os.platform()) {
              case 'win32': {
                logger.log(
                  `3. Add "${targetLib}" to the PATH environment variable via the following command:`,
                )
                logger.log(`   SET PATH=%PATH%;${targetLib};`)
                logger.log(
                  '4. Run "npm install node-rfc --save" in the current project folder.',
                )

                break
              }

              case 'darwin':
              case 'linux': {
                logger.log(
                  '3. As root, create a file "/etc/ld.so.conf.d/nwrfcsdk.conf" and add the following content:',
                )
                logger.log('   # include nwrfcsdk')
                logger.log(`   ${targetLib}`)
                logger.log('4. As root, run the command "ldconfig".')
                logger.log(
                  '5. Run "npm install node-rfc --save" in the current project folder.',
                )

                break
              }

              default: {
                // Should not be reached
              }
            }

            process.exit(0)
          }

          // Start server with configuration
          const server: Object = new Server(config)
          server.start()

          // Update configuration in server if the file changes
          fs.watch(pathToConfig, () => config.set(loadConfig(pathToConfig)))

          break
        }

        case 'docker': {
          const port = config.get('server.port')

          // Build docker container
          const spawn = childProcess.spawn
          const docker = spawn('docker', [
            'build',
            `--build-arg R3CONNECT_PORT=${port}`,
            '-t',
            project.name,
            '.',
          ])

          // Once it is ready
          docker.on('close', (code: number) => {
            if (code === 0) {
              logger.success(
                `The Docker container was successfully built. Start the container by running "docker run -it -p ${port}:${port} ${project.name}".`,
              )
            }
          })

          // Or it failed?
          docker.on('error', () => {
            logger.error(
              'There was an issue while building the Docker container. Please install Docker first and check the Docker logs in order to solve the issue.',
            )
          })

          break
        }

        default: {
          // Should not be reached
        }
      }

      break
    }

    default: {
      logger.info('Please use any of the following commands:')
      logger.log('r3connect init')
      logger.log('r3connect server')
      logger.log('r3connect docker')
    }
  }
}
