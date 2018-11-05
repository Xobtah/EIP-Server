FROM node:8-stretch

# Install Mocha
RUN npm i -g mocha

# Install EIP-Server
ADD . /opt
WORKDIR /opt
RUN npm install

# Start server
CMD [ "npm", "run", "docker" ]
EXPOSE 8080
