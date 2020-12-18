# GraphQL routing / query splitting

The idea is to split a query and map into separate documents to be handled with distinct destionations.

Example in test.

`npm test`

### Example express server

`node example/server.js`

and then

`curl --url "http://localhost:3000/graphql" --request POST --header "Content-Type: application/json" --data '{"query": "query { foo, bar }"}'`