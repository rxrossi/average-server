# Sign in

route: '/users/signin'
method: POST

```js
body: {
  email: String;
  password: String;
}
```

## Successful response

```js
{
  response: {
    token: String;
  }
}
```

## Error example

```js
{
  error: {
    message: String;
    fields: {
      fieldName: String;
    }
  }
}
```

# Sign Up

route: '/users/signup'
method: POST

```js
body: {
  email,
  password,
  confirmPassword,
}
```

## Successful response

```js
{
  response: {
    token: String;
  }
}
```

## Error example

```js
{
  error: {
    message: String;
    fields: {
      fieldName: String;
    }
  }
}
```
