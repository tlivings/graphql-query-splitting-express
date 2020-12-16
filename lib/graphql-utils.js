'use strict';

const { Kind } = require('graphql');

//Pluck off variable definitions needed by a given set of arguments from the set of all variable definitions
function pluckVariables(variableDefinitions, selectionArguments) {
  const pruned = [];

  for (const arg of selectionArguments) {
    if (arg.value.kind === Kind.VARIABLE) {
      for (let i = 0; i < variableDefinitions.length; i++) {
        if (variableDefinitions[i].variable.name.value === arg.value.name.value) {
          pruned.push(variableDefinitions.splice(i, 1));
        }
      }
    }
  }

  return pruned;
}

//Break up the given document into multiple query documents
function splitDocumentByDestination(mapOperation, parentDocument) {
  const documents = {};
  const destinationDefinitions = {};

  //Each top level definition is going to be a query set, mutation set, etc
  for (const definition of parentDocument.definitions) {
    const operationName = definition.operation;
    const parentVariableDefinitions = [...definition.variableDefinitions];

    //Each top level selection of a query or mutation is going to be a root operation that may use a different destination
    for (const selection of definition.selectionSet.selections) {
      const selectionName = selection.name.value;

      const destination = mapOperation(operationName, selectionName);

      //If a document doesn't exist for the split set, create one
      if (!documents[destination]) {
        documents[destination] = {
          kind: Kind.DOCUMENT,
          definitions: []
        };
      }

      //Start building up the definitions to go in destination document
      if (!destinationDefinitions[destination]) {
        destinationDefinitions[destination] = {}
      }
      //If no definition exists for this destination's operation yet, create a new empty one
      if (!destinationDefinitions[destination][operationName]) {
        destinationDefinitions[destination][operationName] = {
          kind: Kind.OPERATION_DEFINITION,
          operation: operationName,
          variableDefinitions: [],
          directives: [],
          selectionSet: {
            kind: Kind.SELECTION_SET,
            selections: []
          }
        };
        //Push this definition on the document being built for the destination
        documents[destination].definitions.push(destinationDefinitions[destination][operationName]);
      }

      //Update the new document's variable definitions with the variable definitions used by this selection
      destinationDefinitions[destination][operationName].variableDefinitions.push(...pluckVariables(parentVariableDefinitions, selection.arguments));

      //Update the current operation's selection set with the current selection
      destinationDefinitions[destination][operationName].selectionSet.selections.push(selection);
    }
  }

  return documents;
}

module.exports = { splitDocumentByDestination };