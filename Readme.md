LDA
--------

Latent Dirichlet allocation (LDA) topic modeling in javascript for node.js.
LDA is a machine learning algorithm that extracts topics and their related keywords from a collection of documents.

In LDA, a document may contain several different topics, each with their own related terms. The algorithm uses a probabilistic model for detecting the number of topics specified and extracting their related keywords. For example, a document may contain topics that could be classified as beach-related and weather-related. The beach topic may contain related words, such as sand, ocean, and water. Similarly, the weather topic may contain related words, such as sun, temperature, and clouds.

See http://en.wikipedia.org/wiki/Latent_Dirichlet_allocation

```bash
$ npm install lda
```

## Usage
```javascript
var lda = require('lda');

// Example document.
var text = 'Cats are small. Dogs are big. Cats like to chase mice. Dogs like to eat bones.';

// Extract sentences.
var documents = text.match( /[^\.!\?]+[\.!\?]+/g );

// Run LDA to get terms for 2 topics (5 terms each).
var result = lda(documents, 2, 5);
```

The above example produces the following result with two topics (topic 1 is "cat-related", topic 2 is "dog-related"):
```
Topic 1
cats (0.21%)
dogs (0.19%)
small (0.1%)
mice (0.1%)
chase (0.1%)

Topic 2
dogs (0.21%)
cats (0.19%)
big (0.11%)
eat (0.1%)
bones (0.1%)
```

## Output

LDA returns an array of topics, each containing an array of terms. The result contains the following format:

```
[ [ { term: 'dogs', probability: 0.2 },
    { term: 'cats', probability: 0.2 },
    { term: 'small', probability: 0.1 },
    { term: 'mice', probability: 0.1 },
    { term: 'chase', probability: 0.1 } ],
  [ { term: 'dogs', probability: 0.2 },
    { term: 'cats', probability: 0.2 },
    { term: 'bones', probability: 0.11 },
    { term: 'eat', probability: 0.1 },
    { term: 'big', probability: 0.099 } ] ]
```

The result can be traversed as follows:

```javascript
var result = lda(documents, 2, 5);

// For each topic.
for (var i in result) {
	var row = result[i];
	console.log('Topic ' + (parseInt(i) + 1));
	
	// For each term.
	for (var j in row) {
		var term = row[j];
		console.log(term.term + ' (' + term.probability + '%)');
	}
	
	console.log('');
}
```

## Additional Languages

LDA uses [stop-words](https://en.wikipedia.org/wiki/Stop_words) to ignore common terms in the text (for example: this, that, it, we). By default, the stop-words list uses English. To use additional languages, you can specify an array of language ids, as follows: 

```javascript
// Use English (this is the default).
result = lda(documents, 2, 5, ['en']);

// Use German.
result = lda(documents, 2, 5, ['de']);

// Use English + German.
result = lda(documents, 2, 5, ['en', 'de']);
```

To add a new language-specific stop-words list, create a file /lda/lib/stopwords_XX.js where XX is the id for the language. For example, a French stop-words list could be named "stopwords_fr.js". The contents of the file should follow the format of an [existing](https://github.com/primaryobjects/lda/blob/master/lib/stopwords_en.js) stop-words list. The format is, as follows:

```javascript
exports.stop_words = [
    'cette',
    'que',
    'une',
    'il'
];
```

## Setting a Random Seed

A specific random seed can be used to compute the same terms and probabilities during subsequent runs. You can specify the random seed, as follows:

```javascript
// Use the random seed 123.
result = lda(documents, 2, 5, null, null, null, 123);
```

## Author

Kory Becker
http://www.primaryobjects.com

Based on original javascript implementation
https://github.com/awaisathar/lda.js
