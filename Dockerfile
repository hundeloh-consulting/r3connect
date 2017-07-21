FROM ubuntu:16.04

# Install NodeJS
RUN apt-get -qq update
RUN apt-get install -y build-essential libssl-dev curl git sudo tar python
RUN apt-get purge nodejs nodejs-legacy npm
RUN apt-get update
RUN curl -sL https://deb.nodesource.com/setup_7.x | sudo -E bash -
RUN apt-get install -y nodejs
RUN npm cache clean

# Global npm dependencies
RUN npm install -g semver
RUN npm install -g forever

# Copy nwrfc
ARG NWRFCSDK_PATH=./vendor/nwrfcsdk/
RUN mkdir /usr/sap/
RUN mkdir /usr/sap/nwrfcsdk
ADD $NWRFCSDK_PATH /usr/sap/nwrfcsdk
ADD ./vendor/nwrfcsdk.conf /etc/ld.so.conf.d/
RUN ldconfig

# Install node-rfc (only possible after nwrfc was copied)
WORKDIR /tmp/node-rfc
ENV SAPNWRFC_HOME /usr/sap/nwrfcsdk
RUN npm install --unsafe-perm

# Install r3connect
RUN npm install r3connect -g

# Copy current project
RUN mkdir -p /opt/project
ADD ./package.json /opt/project/package.json
WORKDIR /opt/project
RUN npm install 
ADD . /opt/project

# Expose port
ARG R3CONNECT_PORT
ENV R3CONNECT_PORT ${R3CONNECT_PORT}
EXPOSE $R3CONNECT_PORT

# Run app using forever
WORKDIR /opt/project
CMD ["r3connect", "server"]