// neo4jfunc.js

// require neo4j help functions
// var neo4j = require("node-neo4j");

// var neo4jURL = "http://127.0.0.1:7474";
// db = new neo4j(neo4jURL);

var rest = require('restler');
var Promise = require('bluebird');
var url = "http://127.0.0.1:7474/db/data/cypher";
// var url = "http://172.12.8.150:7474/db/data/cypher";

var masterDict = {
  has : function (word) { 
    return !!this.words.hasOwnProperty(word);
  },
  add: function (word) {
    if (!this.has(word)) {
      this.words[word] = 0;
      this._length++;
    }
    return this.size();
  },
  size: function () {
    return this._length;
  },
  words : {},
  _length: 0
};

var doc1 = {
  title: "greg",
  url: "http://www.gregorylull.com",
  words: {
    i: 1,
    like: 1,
    dogs: 1
  }
};

var doc2 = {
  title: "lull",
  url: "http://www.iamthelull.com",
  words: {
    i: 1,
    want: 1,
    dogs: 1
  },
  length: 3
};

var query1 = {
  "query" : "CREATE (d:Doc { doc_prop } ) RETURN d",
  "params": {
    "doc_prop" : {
      "title" : doc1.title,
      "url"   : doc1.url
    }
  }
};


var consoleResults = function (result, title) {
  title = title || "result";
  console.log(
    '\n\n' + title + 'START ############################: \n\n', 
    result,
    '\n\n' + title + 'END   ############################: \n\n'
  );
};

var createDocQuery = function (doc) {
  var postData          = {};
  postData.params       = {};
  postData.params.props = {};
  postData.query = "CREATE (n:Doc { props }) RETURN n";
  for (var key in doc) {
    if (key !== 'words') {
      postData.params.props[key] = doc[key];
    }
  }
  return postData;
};

/*
  // given article
  // insert document node
  //   .on(complete) 
  //     check if doc word in master dict (create array of missing)
  //      if yes -> create relationship between doc and node
  //      if no  -> update master dict, create word node AND relationship
*/


var createMissing = function (doc, masterDict) {
  var array = [];
  for (var word in doc) {
    if (!masterDict.has(doc.words[word])) {
      masterDict.add(word);
      array.push({key: doc.words[word]});
    }
  }
  return array;
};

var createWordInsertQuery = function (word) {
  var postData          = {};
  postData.params       = {};
  postData.params.props = {};
  postData.query = "CREATE (w:Word { props }) RETURN w";
  postData.params.props["word"] = word;
  return postData;
};

var createRelationship = function (start, end) {
  var data = {
    "key" : "name",
    "value" : "Greg",
    "start" : start,
    "end" : end,
    "type" : "tf"
 };
 return data;
};

var findWordQuery = function (word) {
  var postData          = {};
  postData.params       = {};
  postData.params.props = {};
  postData.query = "MATCH (w: Word { props }) RETURN w";;
  postData.params.props["word"] = word;
  return postData;
};
// given article
// insert document node
var insertDocToDB = function (clientRes, doc, masterDict) {
  var wordsToInsert = createMissing(doc, masterDict);
  var docToInsert = createDocQuery(doc);
  rest.postJson(url,docToInsert)
    // .on(complete)  
    .on('complete', function (result, response) {
      // Doc self
      var docSelf = result.data[0][0].self;

      // check if doc word in master dict (create array of missing)      
      for (var word in doc.words) {
        // if no  ->  
        if (!masterDict.has(word)) {
          // update master dict
          masterDict.add(word);
          // create word node AND relationship
          rest.postJson(url, createWordInsertQuery(word))
            .on("complete", function (result, response) {
              var wordSelf = result.data[0][0].self;
              var createUniqueURI = "http://localhost:7474/db/data/index/relationship/MyIndex/?uniqueness=get_or_create";
              rest.postJson(createUniqueURI, createRelationship(docSelf, wordSelf))
                .on("complete", consoleResults);
            });
        // if yes -> create relationship between doc and node
        } else {
          rest.postJson(url, findWordQuery(word))
            .on("complete", function (result, response){
              var wordSelf = result.data[0][0].self;
              var createUniqueURI = "http://localhost:7474/db/data/index/relationship/MyIndex/?uniqueness=get_or_create";
              rest.postJson(createUniqueURI, createRelationship(docSelf, wordSelf))
                .on("complete", consoleResults);
            });
        }
      }

      // clientRes.render('index', {title: "something"});
    });
};

var deleteDB = function () {
  var postData = {};
  postData.query = "MATCH (n) OPTIONAL MATCH (n)-[r]-() DELETE n,r";
  return postData;
};

rest.postJson( url , deleteDB())
  .on('complete', function (result, response) {
  insertDocToDB('test', doc1 , masterDict);
});

module.exports.test = insertDocToDB;

// var query2 = {
//   "query" : "CREATE (n:Person { props } ) RETURN n",
//   "params" : {
//     "props" : {
//       "position" : "Developer",
//       "name" : "Michael",
//       "awesome" : true,
//       "children" : 3
//     }
//   }
// };

// var test = function (res) {
//   rest.post(url, {
//     data: {
//       "query" : "MATCH (n) RETURN n",
//     }
//   }).on('complete', function (result, response) {
//       res.render('index', {title: result.data[0][0].data.url});
//       console.log(response);
//     });
// };


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
