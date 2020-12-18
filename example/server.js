'use strict';

const graphql = require('graphql');
const express = require('express');
const { makeExecutableSchema } = require('graphql-tools');
const graphqlRouting = require('../index');

const schema1 = makeExecutableSchema({
  typeDefs: `
    type Query {
      foo: String
    }
  `,
  resolvers: {
    Query: {
      foo() {
        return `foo.processed`;
      }
    }
  }
});

const schema2 = makeExecutableSchema({
  typeDefs: `
    type Query {
      bar: String
    }
  `,
  resolvers: {
    Query: {
      bar() {
        return `bar.processed`;
      }
    }
  }
});

const middleware = graphqlRouting({
  mapDestination(operation, name) {
    if (name === 'foo') {
      return 'local';
    }
    return 'remote';
  },
  async callDestination(destination, document) {
    return graphql.execute(destination === 'local' ? schema1 : schema2, document, undefined, {});
  }
});

const app = express();

app.post('/graphql', express.json(), middleware, (req, res) => {  
  res.json(req.graphqlRouting.result);
});

const server = app.listen(3000, () => {
  console.log(`server listening on ${server.address().port}`);  
});