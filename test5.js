var lda = require('./lib/lda');

var text = 'Hola, tu estas muy ocupada hoy? Esta bonita afuera, pero hace un poco de calor hoy. Tu tienes algo? Tu quieres ir a el banco? Tu puedes comprar algo aqui con tu dinero.';
var documents = text.match( /[^\.!\?]+[\.!\?]+/g );

var result_en = lda(documents, 2, 5, ['en'], null, null, 123);
var result_es = lda(documents, 2, 5, ['es'], null, null, 123);
var result_multi = lda(documents, 2, 5, ['invalid1', 'en', 'es', 'invalid2'], null, null, 123);

var findTerm = function(term, topics) {
  for (var i in topics) {
    var row = topics[i];
    console.log('Topic ' + (parseInt(i) + 1));

    // For each term.
    for (var j in row) {
      var aterm = row[j];
      console.log(aterm.term + ' (' + aterm.probability + '%)');

      if (aterm.term === term) {
        console.log('*** Found ' + term);
        return term;
      }
    }

    console.log('');
  }

  return null;
};

// For each topic.
var success = true;
var target_term = 'tu'; // Stop-words term that should be removed when using the designated stop-words list (i.e., spanish).

// Look for the stop-word in the resulting topics using English and Spanish. The term should exist in English, but not in Spanish.
console.log('Using English stop-words.');
var result1 = findTerm(target_term, result_en);
if (!result1) {
  console.log('\nFailed English stop-words check. Failed to find expected stop-word: "' + target_term + '" as a topic.')
  return;
}

console.log('\nUsing Spanish stop-words.');
var result2 = findTerm(target_term, result_es)
if (result2) {
  console.log('\nFailed Spanish stop-words check. Found stop-word: "' + target_term + '" as a topic, when it should have been removed.')
  return;
}

console.log('\nUsing English and Spanish stop-words.');
var result3 = findTerm(target_term, result_multi);
if (result3) {
  console.log('\nFailed Multiple stop-words check. Found stop-word: "' + target_term + '" as a topic, when it should have been removed.')
  return;
}

// Confirm the probabilities are equal when using the Spanish stop-words list and a list containing Spanish and invalid stop-word paths.
const groupProbs1 = [];
result_es.forEach(group => {
  group.forEach(row => {
    groupProbs1.push(row.probability);
  });
});

const groupProbs2 = [];
result_multi.forEach(group => {
  group.forEach(row => {
    groupProbs2.push(row.probability);
  });
});

for (var i=0; i<groupProbs1.length; i++) {
  if (groupProbs1[i] !== groupProbs2[i]) {
    console.log('\nFailed probability check for Spanish stop-words multi list.')
    console.log(groupProbs1[i]);
    console.log(groupProbs2[i]);
    return;
  }
}

if (success) {
  console.log('\nResult OK.');
}
