# Websocket API

## Chat

### Events list

* `registerMessages`

Register for receiving message notifications AND sending messages.

Data:
- token: User's token

Response:
You get a message "OK" from this channel.

In case of error, you get the error message on the channel `info`.

* `snippets`: Get the snippets of all the conversations

Data:
Nothing to send.

Response:
The user gets his data in the channel `snippets`, once the event is fired, the data received looks like `{ id: IdOfTheCorrespondant, message: MessageObject }`.
Note that a data received in this channel is for one conversation, it means that if the user has multiple conversations, he will receive an event `snippets` per conversation he has.

In case of error, you get the error message on the channel `info`.

* `conversation`: Get a specific conversation

Data:
- id: The id of the correspondant

Response:
The response is received in the channel `conversation`, it looks like that `{ id: IdOfTheCorrespondant, messages: [ Message1, Message2, ... ] }`.

In case of error, you get the error message on the channel `info`.

* `message`: Send/Receive a message

SENDING MESSAGES

Data:
- to: Id of the correspondant
- content: Content of the message

Response:
You get `{ success: true }` if it worked.

In case of error, you get the error message on the channel `info`.

RECEIVING MESSAGES

Listen to the event `message`, if you receive a message, you get the message through this event.

* `startWriting`: Notify that the user started typing in the conversation

Data:
- id: The id of the correspondant

Response:
The sender doesn't care about the return of that event. The listenner receives data formated like that `{ id: TheIdOfTheGuyWhoStartedWriting }` on the channel `startWriting`.

* `stopWriting`: Notify that the user stopped typing in the conversation

Data:
- token: User's token
- id: The id of the correspondant

Response:
The sender doesn't care about the return of that event. The listenner receives data formated like that `{ id: TheIdOfTheGuyWhoStoppedWriting }` on the channel `stopWriting`.