Online code editor, allows multiple users

# How to run 
1. `npm i`
2. `tsc`
3. `node dist/server/index.js`
---
# TODO

## Back-end
- [x] message class
- [x] app connection
- [x] app channel
- [x] ws endpoint
- [x] channel and endpoint tests
- [x] switch to typescript
- [x] add missing test for sending the client a joined message
- [x] update tests to use new message classes
- [x] rate limiter for /:id
- [x] middleware to limit/throttle ws requests 
- [x] catch json parse error and close socket
- [x] csp policy
- [x] cors
- [x] limit ws message length
- [x] refactor handlewebsocket
- [x] fix handlewebsocket tests
- [ ] add tests for limiting number of ws connections
- [x] add tests for validating ws messages
- [ ] rate limit ws messages
- [x] fix message types so that ts can infer the payload from the type
- [ ] broadcast caret position

## Front-end
- [x] strip html function
- [x] js parser
- [x] transform editor content function
- [x] switch to typescript
- [x] ability to change username
- [x] send url channel id when connecting to server
- [x] update url with channel id from server
- [x] display message when other users join/leave
- [x] display message when other users change names 
- [x] implement a modal to display messages
- [x] write tests for handleSocketMessage logic
- [x] show other people's code
- [x] remove update button and make username update debounced
- [x] fix js parser test
- [x] fix transform editor content test
- [x] save caret position
- [ ] write tests for caret position class
- [ ] show other people's caret position

