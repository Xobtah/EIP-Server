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

## Routes

### Tested

/coach/ routes use the same controllers, thus, all the /user/ routes can be used using /coach/.

* POST /api/user/register : Register new user

 Data: Body { username: [username], password: [password], email: [email], firstName: [first name], lastName: [last name], birthDate: [date formated birth date] }
 
* POST /api/user/login : Login

 Data: Body { username: [username], password: [password] }
 
* POST /api/user/edit/password : Edit logged user password

 Data: Header { token: [JWT] } Body { password: [current password], newPassword: [new password] }
 
* POST /api/user/edit/email : Edit logged user email

 Data: Header { token: [JWT] } Body { password: [password], email: [new email] }
 

* DELETE /api/user : Delete logged user

 Data: Header { token: [JWT] } Body { password: [password] }
 
### Untested

* GET /api/user : Getting the logged user

 Data: Header { token: [JWT] }

* POST /api/coach/edit/username : Getting the logged user

 Data: Header { token: [JWT] } Body { password: [password], username: [new username MUST BE UNIQUE] }
 
* GET /api/post/:id : Get the post if id :id

* POST /api/post : Create new post

 Data: Header { token: [JWT] } Body { content: [post's content] }

* DELETE /api/post/:id : Delete the post if id :id

* GET /api/message/:id : Get the message of id :id

 Data: Header { token: [JWT] }
 
* POST /api/message : New message

 Data: Header { token: [JWT] } Body { content: [message's content], to: [user id] }

* DELETE /api/message/:id : Delete message of id :id

 Data: Header { token: [JWT] }
