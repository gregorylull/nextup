var fs = require('fs');
var path = require('path');
var Promise = require('bluebird');

console.log('\n**** start *****\n');

// other tests


/* 
setup
// read all files
// parse each file
// wordunique
// wordcount
// file
// link
// wordtable

// check stats

*/

var json = path.join(__dirname, 'json');

var filenames = fs.readdirSync(json);

var filelist = {
  totalLetters: 0,
  totalFiles: 0,
  list: {},
  relationships: 0,
  averageRelationships: function () {
    return Math.floor(this.relationships/this.totalFiles);
  },

  average: function () {
    return Math.floor(this.totalLetters/this.totalFiles);
  },
  add: _populateFilenames
};

var dictionary = {
  totalUniqueWords: 0,
  add: _populateDict,
  list: {},
  wordcount: 0,
  average: function (files) {
    return Math.floor(this.wordcount/files);
  }
};

var startTime = new Date();
for (var i = 0; i < filenames.length; i++) {
  if (filenames[i] !== '.DS_Store') {
    var filepath = path.join(json, filenames[i]);
    var fileObj = JSON.parse(fs.readFileSync(filepath, 'utf8'));
    dictionary.add(fileObj.wordtable);
    filelist.add(fileObj);
  }

}
var endTime = new Date();
var diff = new Date(endTime - startTime);

console.log('\nstart time: ', startTime);
console.log('end time:   ', endTime);
console.log(diff.getMinutes(), 'min ', diff.getSeconds(), 'sec', diff.getMilliseconds(), 'msec');

console.log('\ntotal docs: ', filelist.totalFiles, 'total rel: ', filelist.relationships, ', avg relation: ', filelist.averageRelationships());
console.log('total unique words: ', dictionary.totalUniqueWords,', average words per doc: ', dictionary.average(filelist.totalFiles));

var totalRelBytes = filelist.relationships * 33;
var totalWordNodeBytes = dictionary.totalUniqueWords * 9;
var totalDocNodeBytes = filelist.totalFiles * 9;
var totalCosSimBytes = _cosineSimBytes(filelist.totalFiles);

var totalBytes = totalRelBytes + totalWordNodeBytes + totalDocNodeBytes + totalCosSimBytes;

console.log('\ntotal docs: ', filelist.totalFiles, ', doc node bytes: ', totalDocNodeBytes, ', word node bytes: ', totalWordNodeBytes, ', rel bytes: ', totalRelBytes);
console.log('cosine sim total bytes: ', totalCosSimBytes, ', to mb: ', totalCosSimBytes/Math.pow(10, 6), ', to gb: ', totalCosSimBytes/Math.pow(10, 9));
console.log('total bytes: ', totalBytes, ', to mb: ', totalBytes/Math.pow(10, 6), ', to gb: ', totalBytes/Math.pow(10, 9));

function _cosineSimBytes (total) {
  var sum = 0;
  for (var i = 0; i < total; i++) {
    sum += i;
  }
  return sum;
}

// add words to a dictionary
function _populateDict (words) {
  for (var word in words) {
    if (!this.list.hasOwnProperty(word)) {
      this.list[word] = 0;
      this.totalUniqueWords++;
    } 

    num = typeof words[word] === 'number' ? words[word] : 0;

    this.list[word] += num;
    this.wordcount += num;
  }
}

function _populateFilenames (file) {
  this.totalLetters += file.file.length;
  this.totalFiles++;
  this.list[file.file] = file;
  this.relationships += file.wordunique;
}

console.log('\n ****** ends ****** \n');
