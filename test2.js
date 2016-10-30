var lda = require('./lib/lda');

var text = 'Cats are small. Dogs are big. Cats like to chase mice. Dogs like to eat bones.';
var documents = text.match( /[^\.!\?]+[\.!\?]+/g );
var seed = 123;

// Test using random seed for reproducible results.
var isOk = true;
var results = [];
for (var i = 0; i < 10; i++) {
    results.push(lda(documents, 3, 6, null, null, null, 123));
}

// Compare each result in the set to ensure matching terms and probability values.
for (var i in results) {
    var result = results[i];

    for (var j in result) {
        var row1 = result[j];

        for (var k in row1) {
            var term1 = row1[k];

            // Compare this term1 to the term1 in all other results.
            for (var l in results) {
                var result2 = results[l];

                // Take same index row as first result.
                var row2 = result2[j];
                var term2 = row2[k];

                //console.log(term1.term + ' (' + term1.probability + ') ' + term2.term + ' (' + term2.probability + ')'); 

                if (term1.term != term2.term || term1.probability != term2.probability) {
                    console.log('Failed match! Term ' + term1.term + ' (' + term1.probability + ') != ' + term2.term + ' (' + term2.probability + ')');
                    isOk = false;
                }
            }
        }
    }
}

if ((results[0][0][0].probability != 0.18 || results[0][0][1].probability != 0.15 || results[0][0][2].probability != 0.12) ||
    (results[0][1][0].probability != 0.2 || results[0][1][1].probability != 0.15 || results[0][1][2].probability != 0.12))
{
    console.log('Failed expected values for random seed ' + seed + '.')
    isOk = false;
}

if (isOk) {
    console.log('\nRandom seed (' + seed + ') OK.');
}

// Test with no documents.
var noDocsResult = lda(null, 2, 5);
console.log(noDocsResult.length == 0);