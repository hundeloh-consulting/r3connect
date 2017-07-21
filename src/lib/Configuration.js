import Joi from 'joi'
import { findByPath, isFunction, makeLoggable } from './../utils'

export default makeLoggable(
  class Configuration {
    config: ?Object = null
    fallbackConfig: ?Object = null

    constructor(config: ?Object | Function, fallbackConfig: Object) {
      this.fallbackConfig = fallbackConfig
      this.set(config)
    }

    static validate(config: Object): boolean {
      const schema = Joi.object().keys({
        server: Joi.object().keys({
          host: Joi.string(),
          port: Joi.number().min(1),
          routes: Joi.object().keys({
            cors: Joi.boolean(),
          }),
          tls: Joi.object().keys({
            key: Joi.binary(),
            cert: Joi.binary(),
          }),
        }),
        logs: Joi.object().keys({
          tags: Joi.array().items(Joi.string()),
        }),
        connections: Joi.object().pattern(
          /\w+/,
          Joi.object().keys({
            username: Joi.string().token().max(12).allow('').allow(null),
            password: Joi.string().max(40).allow('').allow(null),
            applicationServer: Joi.string().allow('').allow(null),
            instanceNumber: Joi.number().integer().min(0).max(99),
            client: Joi.number().integer().min(0).max(999),
            router: Joi.string().allow('').allow(null),
            functionModules: Joi.object().keys({
              whitelist: Joi.array().items(Joi.string()),
              blacklist: Joi.array().items(Joi.string()),
            }),
          }),
        ),
      })
      const result: Object = Joi.validate(config, schema)

      // Provide details about the failed validation
      if (result.error) {
        throw result.error
      }

      return true
    }

    set(content: ?Object | Function) {
      if (!content) {
        this.log(
          'error',
          'The configuration provided is empty and hence the standard configuration file will be used.',
        )
        this.config = this.fallbackConfig
      } else {
        let config: ?Object = null

        // Content could be an extension or a config
        if (typeof content === 'function') {
          config = content(this.fallbackConfig)
        } else {
          config = content
        }

        // Validate configuration against the defined schema
        try {
          Configuration.validate(config)
          this.log('debug', 'Successfully reloaded configuration.')
          this.config = config
        } catch (error) {
          this.log(
            'error',
            `Unfortunately the new configuration does not follow the allowed schema and thus the old configuration wil be kept. The error was: ${error.message}`,
          )
          this.config = this.config || this.fallbackConfig
        }
      }
    }

    get(path: string): any {
      let value: any = findByPath(this.config, path)

      // Take value from fallback configuration if it was not found
      if (value === undefined) {
        value = findByPath(this.fallbackConfig, path)
      } else if (isFunction(value)) {
        // Allow extensibility by calling the function with the fallback value
        const fallbackValue: any = findByPath(this.fallbackConfig, path)
        value = value(fallbackValue)
      }

      if (value === undefined) {
        this.log(
          'error',
          `The requested configuration for path "${path}" does not exist.`,
        )
      }

      return value
    }
  },
)
