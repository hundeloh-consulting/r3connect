![r3connect](https://cdn.rawgit.com/hundeloh-consulting/r3connect/master/logo.svg)

[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

_r3connect_ is a lean wrapper of [node-rfc](https://github.com/SAP/node-rfc/) that provides comfortable access to SAP back-ends via a simple REST API or via a Promise-based API.
All remote function calls are handled via connection pools in order to reuse connections as much as possible and run function calls in parallel. 
Technical errors are prettified and mapped to corresponding HTTP responses. 
In favor of simplification this module is also designed to run in a container with [Docker](https://www.docker.com/).

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

### Prerequisites

Install the latest LTS version of [Node.js](https://nodejs.org/en/download/). 
In case you did not use the installer, make sure that `node` and `npm` are available in the terminal.
In order to use _r3connect_ you need to obtain the _SAP NW RFC Library_ from the _SAP Service Marketplace_ [Software Download Center](https://support.sap.com/swdc).
If you want to build a _Docker_ container, also install [Docker](https://www.docker.com/).

### Installing

#### Node module

In case you would like to call a RFC within your existing node script without using the REST API you can also install _r3connect_ as a dependency:
```
npm install r3connect --save
```

Please make sure that you installed _node-rfc_ 
```
npm install node-rfc --save
```

Afterwards you can require _r3connect_ and call any RFC:
```javascript
const r3connect = require('r3connect');

// Define connection configuration
const configuration = {
  applicationServer: 'example.company.corp',
  instanceNumber: 1,
  username: 'testuser',
  password: 'helloworld',
  client: 123,
  router: '',
};

// Acquire client from pool
r3connect.Pool.get(configuration).acquire()
.then(function (client: Object) {
  // Actually call the back-end
  return client.invoke('RSIM_RFC_CONNECTION_TEST', { 
    iv_test: 'test'
  });
})
.then(function (response) {
  // Output response
  const result = response[0];
  const meta = response[1];
  
  console.log('Result:');
  console.log(result);
  console.log('Metadata:');
  console.log(meta);
})
.catch(function (error) {
  // Output error
  console.log('Error:');
  console.log(error);
});
```

Or alternatively in ES6 syntax:
```javascript
import { Pool } from 'r3connect';

// Define connection configuration
const configuration = {
  applicationServer: 'example.company.corp',
  instanceNumber: 1,
  username: 'testuser',
  password: 'helloworld',
  client: 123,
  router: '',
};

// Acquire client from pool
Pool.get(configuration).acquire()
.then((client) => {
  return client.invoke('RSIM_RFC_CONNECTION_TEST', { 
    iv_test: 'test'
  });
})
.then(([result, meta]) => {
  console.log('Result:');
  console.log(result);
  console.log('Metadata:');
  console.log(meta);
})
.catch((error) => {
  console.log('Error:');
  console.log(error);
});
```

#### Local Server

Open the terminal and install _r3connect_ globally. This usually takes some time which you can use to grab a cup of coffee or tea.
```
npm install r3connect -g
```

To generate a new project, navigate to the directory where you want it to be and type. Skip the parts that you cannot or do not want to answer.

```
npm init
```

This will generate a `package.json` which will define your new project including all dependencies. 
Afterwards kick-start your first _r3connect_ project by running:

```
r3connect init
```

This should initialize your project folder with all necessary files to start with. If you want to start a local server run:

```
r3connect server
```

Depending on which hostname and port you defined in `config.js` the server will be available via https://localhost:3001/ by default. 
For example, if you want to invoke the remote-enabled function module `RSIM_RFC_CONNECTION_TEST`, execute the following POST request.
The endpoint in this case would be https://localhost:3001/rfc/RSIM_RFC_CONNECTION_TEST and the body of the request would contain values for `applicationServer`, `instanceNumber`, `client`, `username`, `password` and `parameters` (JSON object). 

```http
POST /rfc/RSIM_RFC_CONNECTION_TEST HTTP/1.1
Host: localhost:3001
Content-Type: multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW
Cache-Control: no-cache

------WebKitFormBoundary7MA4YWxkTrZu0gW
Content-Disposition: form-data; name="applicationServer"

example.company.corp
------WebKitFormBoundary7MA4YWxkTrZu0gW
Content-Disposition: form-data; name="username"

testuser
------WebKitFormBoundary7MA4YWxkTrZu0gW
Content-Disposition: form-data; name="password"

helloworld
------WebKitFormBoundary7MA4YWxkTrZu0gW
Content-Disposition: form-data; name="instanceNumber"

1
------WebKitFormBoundary7MA4YWxkTrZu0gW
Content-Disposition: form-data; name="client"

123
------WebKitFormBoundary7MA4YWxkTrZu0gW
Content-Disposition: form-data; name="parameters"

{ "iv_test": "test" }
------WebKitFormBoundary7MA4YWxkTrZu0gW--
```

An example response would look like this:
```json
{
  "result": {
    "E_INVOKED": "X"
  },
  "meta": {
    "invokeTime": 54,
    "connectTime": 102
  }
}
```

#### Docker

Similar to the local server, open the terminal and install _r3connect_ globally:
```
npm install r3connect -g
```

To generate a new project, navigate to the directory where you want it to be and type. Skip the parts that you cannot or do not want to answer.

```
npm init
```

This will generate a `package.json` which will define your new project including all dependencies. 
Afterwards kick-start your first _r3connect_ project by running:

```
r3connect init
```

This should initialize your project folder with all necessary files to start with. If you want to create the _Docker_ container, run:

```
r3connect docker
```

## Running the tests

Mocha tests are implemented and you can run all tests via
```
npm run test
```

## Built With

* [hapi.js](https://hapijs.com/) - Rich framework for building applications and services
* [node-rfc](https://github.com/SAP/node-rfc/) - nodejs RFC Connector
* [pool2](https://github.com/myndzi/pool2) - Simple resource pool

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests to us.

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/hundeloh-consulting/r3connect/tags). 

## Authors

* **Julian Hundeloh** - *Initial work* - [jaulz](https://github.com/jaulz)

See also the list of [contributors](https://github.com/hundeloh-consulting/r3connect/contributors) who participated in this project.

## License

This project is licensed under the AGPL-3.0+ License - see the [LICENSE.md](LICENSE.md) file for details. 
If you are interested in other options please get in touch via [julian@hundeloh-consulting.ch](mailto:julian@hundeloh-consulting.ch).

## Acknowledgments

* Thanks to [SAP](https://github.com/SAP) for making [node-rfc](https://github.com/SAP/node-rfc/) open source.
