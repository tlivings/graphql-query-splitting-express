'use strict';

const gql = require('graphql-tag');
const { splitDocumentByDestination } = require('./lib/graphql-utils');

function graphqlRouter({
  // function (operation: String, attribute: String): String
  // responsible for mapping the root operation to a unique key
  mapDestination, 
  // async function (destinationName: String, document: GraphQLDocument) : { [key: String]: String }
  // responsible for executing the document against the given destination key
  callDestination 
}) {
  
  return function (req, res, next) {    
    const document = gql(req.body.query);
    
    const documents = splitDocumentByDestination(mapDestination, document);
    
    const work = Object.entries(documents).map(([destination, document]) => {
      return callDestination(destination, document);
    });

    Promise.all(work).then((results) => {
      const merged = results.reduce((merge, result) => {
        merge.data = Object.assign(merge.data, result.data);
        
        if (result.errors && result.errors.length) {
          merge.errors.push(...result.errors);
        }
        
        return merge;
      }, { data: {}, errors: [] });
      
      req.graphqlRouting = {
        result: merged,
        originalQuery: req.body
      };
      
      next();
    }).catch(next);
  };
}

module.exports = graphqlRouter;