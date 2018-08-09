FROM node:8-stretch

# Copy EIP-Server
ADD . /opt
WORKDIR /opt
RUN npm install

# Start server
CMD [ "npm", "start" ]
EXPOSE 8080

# Set workdir
WORKDIR /opt