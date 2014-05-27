var lda = require('./lib/lda');

var text = 'Cats are small. Dogs are big. Cats like to chase mice. Dogs like to eat bones.';
var documents = text.match( /[^\.!\?]+[\.!\?]+/g );

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