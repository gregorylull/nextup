// neo4jfunc.js

// require neo4j help functions
// var neo4j = require("node-neo4j");

// var neo4jURL = "http://127.0.0.1:7474";
// db = new neo4j(neo4jURL);

var rest = require('restler');
var Promise = require('bluebird');

var test = function (res) {
  rest.post("http://127.0.0.1:7474/db/data/cypher", {
    data: {
      "query" : "MATCH (n) RETURN n"
    }, 
    
      
  }).on('complete', function (result, response) {
      res.render('index', {title: result.data[0][0].data.url});
      console.log(response);
    });
};

module.exports.test = test;

      // statements: [{
      //   statement: "MATCH (n) RETURN n"
      // }]

// {
//   "statements" : [ {
//     "statement" : "CREATE (n {props}) RETURN n",
//     "parameters" : {
//       "props" : {
//         "name" : "My Node"
//       }
//     }
// //   } ]
// // }

// CREATE (d1: DOCUMENT {url: "d1 something"}) 
// CREATE (d2: DOCUMENT {url: "d2 something"})
// CREATE (d3: DOCUMENT {url: "d3 something"})
// CREATE (d4: DOCUMENT {url: "d4 something"})
// CREATE (d5: DOCUMENT {url: "d5 something"})

// MATCH (d1: DOCUMENT), (d2: DOCUMENT) CREATE DISTINCT (d1)-[r:COS_SIM {val: 0.8}]->(d2) RETURN r
