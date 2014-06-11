TODO: 
1. prepare for production
2. have a function that turns on testing / turn off??
3. NO, should be writing tests!!!!!!
4. updateRelatinoshipIndex - WRONG KEY, 'TF' is capitalized

IN PROGRESS:
- IF readability does not work, add back to queue, allow 3 chances, then discard

POST HR TODO (new 3.5 ram server, mongolab, transaction query):
- transactions should not be more than 10k-50k elements...
- How does garbage collecting work?? Why does java heap memory never decrease
- scrapeArchive needs to have a directory system, otherwise it will be filled with over tens of thousands of files
  + method1: same as git, we hash the filename and take the first two (or one) letters, lowercase(), and create a directory, and the file will go in there [a-z][a-z] = 26 * 26 folders
  + method2: save json file as mongo file. instead of reading directory, we query mongo for new=true / inserted_to_neo4j=false files...
- transactions lock if the same node is being used...?

- every 15 mins (900 seconds) = update all relationships?
  + only update necessary ones?
  + newly added nodes needs to be connected
- 10,000 articles = 1 * 10^4 * 1 * 10^4 = 100,000,000 = 50 million...
- IDF value stabilizes over time / size of corpus, does not need to be constantly calculated and updated. Maybe once a week or once a day at 2am is enough. 

DONE:
- CHANGE neostore.properties log to less than 5-10 gigs of hard drive space (on server)
- do not move files from json/ to scrapeArchive/ during checkDir() IF cos sim values are being calculated
  + export CalculatingCosSim from batchOp and require cronBatch?? 
  + TEST: JSON files should not be moved while there is a calculation --> 
    + 1. mv 500 files to json/ === initial batchInsert = 500 files 
    + 2. set batchInsert cron === checkDir every 30 seconds
    + 3. while COS SIM is calculating, put a file inside the directory
- get rid of hacker news comment threads (askhn*)
  + do not add to queue if the link points back to news.ycombinator.com
  + OR, revisit the same thread for up to 1 week, and constantly update those nodes
  + TEST: extra console.log, get big rss, if any of the queue's title or url contain 'ask hn'



=========
vars
=========

batchURL, cypherURL

masterDict, wordsToAdd, wordsToUpdate

============
functions
============

// return last digits of a http link
getNodeNum(address)

// result from cypher query
addToDict(result, master)

// updates the master dictionary on server side
updateDict(newWords, result, num);

// updates the property 'connections' of words in the master dictionary
updateConnections(arrayWordsToUpdate, reuslts, num)

// returns cypher http rest query that retrieves all words in db
masterDictQuery()

// returns a cypher http rest query that CLEARS the neo4j db
clearQuery()

----

// returns query object with requestID
insertDocBatch(doc, reqID)

// returns
insertWordBatch(word, reqID)

//
addLabelBatch(label, nodeID, reqID)

// 
createRelationshipBatch(docID, wordID, reqID, isInMasterDict, tfValue)

// some thing that HAS to be updated
updateRelationshipIndexBatch(relationshipID, reqID, tfValue)

// updates a specific property on a specific node
updatePropertyBatch(arg, nodeID, reqID, property, isInMasterDict);

//
getPropertyBatch(nodeID, reqID, property, isInMasterDict)

// inserts a whole document, and creates connections to those words
batchInsert(doc, requestID, num)

// recursive function that inserts documents ONE AT A TIME
insertBatchRec(result, response, documentList, num)

// clears the neo4j database and returns a promise upon completion
// *really just sends a query (option), and returns a promise
clearNeo4jDBAsync(neo4jCypherURL, option)

// queries neo4j db for word nodes and adds to global dictionary
populateMasterDictAsync(result, url, option)

-------

cosineSimilarityInsertion(url)

===============
refactor
===============

if word is IN dictionary: 
  insertWord
  .addLabel
  .createRelationship
  .updateProperty
  .getProperty
  .then(wordsToAdd.push()) // executes after server returns success!

else
  retrieveWordFromDic
  .createRelationship
  .updateProperty
  .getProperty
  .then(wordsToUpdate.push()) // executes after server returns success!

===============
Dummy data
===============

dummyDoc1, dummyDoc2, dummyDoc3

// real scraped data
rd1...rd20

docList

===============
module exports
===============

.dummyList
.clearNeo4jDBAsync
.populateMasterDictAsync
.insertBatchRec