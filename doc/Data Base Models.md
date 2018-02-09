# Data Base Models

## Schemas

### User

```JavaScript
{
    username: string,
    password: string,
    email: string,
    firstName: string,
    lastName: string,
    birthDate: Date,
    friends: [ UserId ]
}
```

### Post

```JavaScript
{
    type: PostType,
    creationDate: Date,
    author: UserID,
    content: Object,
    likes: [ UserID ],
    parent: PostID
}
```

### Activity

```JavaScript
{
    coatch: UserID,
    user: UserID,
    content: Object,
    performance: Object
}
```

### Notification

```JavaScript
{
    date: Date,
    type: NotificationType,
    senders: [ UserID ],
    content: Object
}
```

## Enumerations

### NotificationType

```JavaScript
{
    Text: 0,
    Media: 1,
    Activity: 2
}
```

### PostType

```JavaScript
{
    Response: 0,
    Like: 1,
    FriendRequest: 2
}
```
