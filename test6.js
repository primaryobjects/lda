var lda = require('./lib/lda');
const path = require('path');
const fs = require('fs');

const filePath = './custom_lang.js';

// Create a custom stop-words file.
fs.writeFileSync(filePath, 'exports.stop_words = ["ignore"];');

var findTerm = function(term, topics) {
  for (var i in topics) {
    var row = topics[i];

    // For each term.
    for (var j in row) {
      var aterm = row[j];
      if (aterm.term === term) {
        console.log('Found "' + term + '"');
        return term;
      }
    }

    console.log('');
  }

  return null;
};

var text = 'Ignore the stop words to ignore within this ignore text and test the ignore feature.';
var target_term = 'ignore'; // Stop-words term that should be removed when using the designated stop-words list.
var documents = text.match( /[^\.!\?]+[\.!\?]+/g );
var results;
var success1 = false;
var success2 = false;
var success3 = false;

console.log('Test 1: Run lda with the default stop-words list. Ignore warning.');

results = lda(documents, 2, 5, ['custom_lang'], null, null, 123);

// Look for the stop-word in the resulting topics.
result = findTerm(target_term, results);
if (result) {
  success1 = true;
}
else {
  console.log('\nFailed Test 1 stop-words check! Error finding stop-word "' + target_term + '" as a topic.')
  fs.unlinkSync(filePath);
  return;
}

console.log('\nTest 2: Run lda with a default stop-words list copied into the lib folder.');

// Copy the language file to a default file in the lib folder.
const copyPath = './lib/stopwords_' + filePath.replace('./', '');
fs.copyFileSync(filePath, copyPath);

results = lda(documents, 2, 5, ['custom_lang'], null, null, 123);

// Look for the stop-word in the resulting topics. It should not be found.
var result = findTerm(target_term, results);
if (result) {
  console.log('\nFailed Test 2 stop-words check! Found stop-word "' + target_term + '" as a topic.')
  fs.unlinkSync(copyPath);
  fs.unlinkSync(filePath);
  return;
}
else {
  success2 = true;
}

// Cleanup.
fs.unlinkSync(copyPath);

console.log('\nTest 3: Register the custom stop-words list.');
lda.registerStopwords('custom_lang', path.resolve(__dirname, filePath));
results = lda(documents, 2, 5, ['custom_lang'], null, null, 123);

// Look for the stop-word in the resulting topics. It should not be found.
result = findTerm(target_term, results);
if (result) {
  console.log('\nFailed Test 3 stop-words check! Found stop-word "' + target_term + '" as a topic.')
  fs.unlinkSync(filePath);
  return;
}
else {
  success3 = true;
}

// Cleanup.
fs.unlinkSync(filePath);

if (success1) {
  console.log('Result 1 OK.');
}

if (success2) {
  console.log('Result 2 OK.');
}

if (success3) {
  console.log('Result 3 OK.');
}
