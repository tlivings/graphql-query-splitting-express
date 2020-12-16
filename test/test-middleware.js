'use strict';

const test = require('tape');
const graphqlRouting = require('../index');

test('middlewware', function (t) {
  
  const middleware = graphqlRouting({
    mapDestination(operation, name) {
      return name;
    },
    callDestination(destination, document) {
      return { data: { [destination]: `${destination}.processed` } };
    }
  });
  
  const req = {
    body: 'query { foo, bar }'
  }
  
  middleware(req, undefined, (error) => {
    t.plan(4);
    t.error(error);
    t.ok(req.graphqlRouting && req.graphqlRouting.result);
    
    const { data } = req.graphqlRouting.result || {};
    
    t.equal(data.foo, 'foo.processed');
    t.equal(data.bar, 'bar.processed');
    
    //console.log(JSON.stringify(req.graphqlRouting, null, 2));
  });
});