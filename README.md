# EIP-Server
SportsFun EIP's server application

## How to use
First, you must install the latest NodeJS version (we're using ES6).
For instance, with a Linux OS using apt-get :
> sudo apt-get install nodejs

This command will also install the npm program, necessary to install the app's dependencies.

Once it's done, clone the repo and go into the folder :
> git clone https://github.com/sportfun/EIP-Server.git

> cd EIP-Server/

Then install the app's dependencies :
> npm install

Or, to the extent that we are overskilled developers :
> npm i

In order to use the automatic and nearly magic npm command that starts the server and restarts it when a file changes, you must install the nodemon tool :
> sudo npm i -g nodemon

NB: It should work without installing it globally, just run npm install and when using npm start, npx should be able to handle it.

You're now ready to launch the app :
> npm start

You can now go to your favourite memory killer browser and go to the following address "localhost:8080".
