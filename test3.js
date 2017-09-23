const lda = require('./lib/lda');

const collection = [
  [
    'Ruby slippers are pretty and fun.',
    'Long walks in the park are fun.',
    '',
    'Slippers are soft on your feet.'
  ],
  [
    'Ruby slippers are pretty and fun.',
    'Long walks in the park are fun.',
    null,
    'Slippers are soft on your feet.'
  ],
  [
    '',
    'Ruby slippers are pretty and fun.',
    'Long walks in the park are fun.',
    'Slippers are soft on your feet.'
  ],
  [
    null,
    'Ruby slippers are pretty and fun.',
    'Long walks in the park are fun.',
    'Slippers are soft on your feet.'
  ],
  [
    'Ruby slippers are pretty and fun.',
    'Long walks in the park are fun.',
    'Slippers are soft on your feet.',
    ''
  ],
  [
    'Ruby slippers are pretty and fun.',
    'Long walks in the park are fun.',
    'Slippers are soft on your feet.',
    null
  ]
];

var probabilities = [];

collection.forEach((documents, i) => {
  const results = lda(documents, 3, 2, null, null, null, 123);

  // Save the probabilities for each group. The values should be the same, since we're using the same random seed.
  const groupProbs = [];
  results.forEach(group => {
    group.forEach(row => {
      groupProbs.push(row.probability);
    });
  });

  // Store the entire group in an array.
  probabilities.push(groupProbs);

  //console.log('\nSet ' + (i + 1));
  //console.log(results);
});

var success = true;

// Verify the probabilities for each group are the same, even with empty and null values in the docs.
probabilities.forEach((group, i) => {
  if (group[0] !== 0.15 || group[1] !== 0.14 || group[2] !== 0.16 || group[3] !== 0.15 || group[4] !== 0.16 || group[5] !== 0.14) {
    console.log('Failed expected values for group ' + i);
    success = false;
  }
});

if (success) {
  console.log('\nResult OK.');
}