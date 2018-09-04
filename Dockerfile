FROM node:6.14.4-stretch

# Copy EIP-Server
ADD . /opt
WORKDIR /opt
RUN npm install

# Start server
CMD [ "npm", "run", "docker" ]
EXPOSE 8080