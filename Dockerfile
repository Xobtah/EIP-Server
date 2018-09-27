FROM node:8-stretch

# Install packages
WORKDIR /opt
ADD ./package.json /opt
RUN npm install

# Copy EIP-Server
ADD . /opt

# Start server
CMD [ "npm", "run", "docker" ]
EXPOSE 8080