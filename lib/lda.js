var stem = require('stem-porter');

//
// Based on javascript implementation https://github.com/awaisathar/lda.js
// Original code based on http://www.arbylon.net/projects/LdaGibbsSampler.java
//
var process = function(sentences, numberOfTopics, numberOfTermsPerTopic, languages, alphaValue, betaValue, randomSeed) {
    // The result will consist of topics and their included terms [[{"term":"word1", "probability":0.065}, {"term":"word2", "probability":0.047}, ... ], [{"term":"word1", "probability":0.085}, {"term":"word2", "probability":0.024}, ... ]].
    var result = [];
    // Index-encoded array of sentences, with each row containing the indices of the words in the vocabulary.
    var documents = new Array();
    // Hash of vocabulary words and the count of how many times each word has been seen.
    var f = {};
    // Vocabulary of unique words (porter stemmed).
    var vocab=new Array();
    // Vocabulary of unique words in their original form.
    var vocabOrig = {};
    // Array of stop words
    languages = languages || Array('en');

    if (sentences && sentences.length > 0) {
      var stopwords = new Array();

      languages.forEach(function(value) {
          var stopwordsLang = require('./stopwords_' + value + ".js");
          stopwords = stopwords.concat(stopwordsLang.stop_words);
      });

      for(var i=0;i<sentences.length;i++) {
          if (sentences[i]=="") continue;
          documents[i] = new Array();

          var words = sentences[i] ? sentences[i].split(/[\s,\"]+/) : null;

          if(!words) continue;
          for(var wc=0;wc<words.length;wc++) {
              var w=words[wc].toLowerCase().replace(/[^a-z\'A-Z0-9\u00C0-\u00ff ]+/g, '');
              var wStemmed = stem(w);
              if (w=="" || !wStemmed || w.length==1 || stopwords.indexOf(w.replace("'", "")) > -1 || stopwords.indexOf(wStemmed) > -1 || w.indexOf("http")==0) continue;
              if (f[wStemmed]) { 
                  f[wStemmed]=f[wStemmed]+1;
              } 
              else if(wStemmed) { 
                  f[wStemmed]=1; 
                  vocab.push(wStemmed);
                  vocabOrig[wStemmed] = w;
              };
              
              documents[i].push(vocab.indexOf(wStemmed));
          }
      }

      var V = vocab.length;
      var M = documents.length;
      var K = parseInt(numberOfTopics);
      var alpha = alphaValue || 0.1;  // per-document distributions over topics
      var beta = betaValue || .01;  // per-topic distributions over words
      documents = documents.filter((doc) => { return doc.length }); // filter empty documents

      lda.configure(documents,V,10000, 2000, 100, 10, randomSeed);
      lda.gibbs(K, alpha, beta);

      var theta = lda.getTheta();
      var phi = lda.getPhi();

      var text = '';

      //topics
      var topTerms=numberOfTermsPerTopic;
      for (var k = 0; k < phi.length; k++) {
          var things = new Array();
          for (var w = 0; w < phi[k].length; w++) {
               things.push(""+phi[k][w].toPrecision(2)+"_"+vocab[w] + "_" + vocabOrig[vocab[w]]);
          }
          things.sort().reverse();
          //console.log(things);
          if(topTerms>vocab.length) topTerms=vocab.length;

          //console.log('Topic ' + (k + 1));
          var row = [];
          
          for (var t = 0; t < topTerms; t++) {
              var topicTerm=things[t].split("_")[2];
              var prob=parseInt(things[t].split("_")[0]*100);
              if (prob<2) continue;
              
              //console.log('Top Term: ' + topicTerm + ' (' + prob + '%)');
              
              var term = {};
              term.term = topicTerm;
              term.probability = parseFloat(things[t].split("_")[0]);
              row.push(term);
          }

          result.push(row);
      }
    }
    
    return result;
}

function makeArray(x) {
    var a = new Array();    
    for (var i=0;i<x;i++)  {
        a[i]=0;
    }
    return a;
}

function make2DArray(x,y) {
    var a = new Array();    
    for (var i=0;i<x;i++)  {
        a[i]=new Array();
        for (var j=0;j<y;j++)
            a[i][j]=0;
    }
    return a;
}

var lda = new function() {
    var documents,z,nw,nd,nwsum,ndsum,thetasum,phisum,V,K,alpha,beta; 
    var THIN_INTERVAL = 20;
    var BURN_IN = 100;
    var ITERATIONS = 1000;
    var SAMPLE_LAG;
    var RANDOM_SEED;
    var dispcol = 0;
    var numstats=0;
    this.configure = function (docs,v,iterations,burnIn,thinInterval,sampleLag,randomSeed) {
        this.ITERATIONS = iterations;
        this.BURN_IN = burnIn;
        this.THIN_INTERVAL = thinInterval;
        this.SAMPLE_LAG = sampleLag;
        this.RANDOM_SEED = randomSeed;
        this.documents = docs;
        this.V = v;
        this.dispcol=0;
        this.numstats=0; 
    }
    this.initialState = function (K) {
        var i;
        var M = this.documents.length;
        this.nw = make2DArray(this.V,K); 
        this.nd = make2DArray(M,K); 
        this.nwsum = makeArray(K); 
        this.ndsum = makeArray(M);
        this.z = new Array();   for (i=0;i<M;i++) this.z[i]=new Array();
        for (var m = 0; m < M; m++) {
                var N = this.documents[m].length;
                this.z[m] = new Array();
                for (var n = 0; n < N; n++) {
                    var topic = parseInt(""+(this.getRandom() * K));                 
                    this.z[m][n] = topic;
                    this.nw[this.documents[m][n]][topic]++;
                    this.nd[m][topic]++;
                    this.nwsum[topic]++;
                }
                this.ndsum[m] = N;
        }
    }
    
    this.gibbs = function (K,alpha,beta) {
        var i;
        this.K = K;
        this.alpha = alpha;
        this.beta = beta;
        if (this.SAMPLE_LAG > 0) {
            this.thetasum = make2DArray(this.documents.length,this.K);
            this.phisum = make2DArray(this.K,this.V);
            this.numstats = 0;
        }
        this.initialState(K);
        //document.write("Sampling " + this.ITERATIONS
         //   + " iterations with burn-in of " + this.BURN_IN + " (B/S="
         //   + this.THIN_INTERVAL + ").<br/>");
        for (i = 0; i < this.ITERATIONS; i++) {
            for (var m = 0; m < this.z.length; m++) {
                for (var n = 0; n < this.z[m].length; n++) {
                    var topic = this.sampleFullConditional(m, n);
                    this.z[m][n] = topic;
                }
            }
            if ((i < this.BURN_IN) && (i % this.THIN_INTERVAL == 0)) {
                //document.write("B");
                this.dispcol++;
            }
            if ((i > this.BURN_IN) && (i % this.THIN_INTERVAL == 0)) {
                //document.write("S");
                this.dispcol++;
            }
            if ((i > this.BURN_IN) && (this.SAMPLE_LAG > 0) && (i % this.SAMPLE_LAG == 0)) {
                this.updateParams();
                //document.write("|");                
                if (i % this.THIN_INTERVAL != 0)
                    this.dispcol++;
            }
            if (this.dispcol >= 100) {
                //document.write("*<br/>");                
                this.dispcol = 0;
            }
        }
    }
    
    this.sampleFullConditional = function(m,n) {
        var topic = this.z[m][n];
        this.nw[this.documents[m][n]][topic]--;
        this.nd[m][topic]--;
        this.nwsum[topic]--;
        this.ndsum[m]--;
        var p = makeArray(this.K);
        for (var k = 0; k < this.K; k++) {
            p[k] = (this.nw[this.documents[m][n]][k] + this.beta) / (this.nwsum[k] + this.V * this.beta)
                * (this.nd[m][k] + this.alpha) / (this.ndsum[m] + this.K * this.alpha);
        }
        for (var k = 1; k < p.length; k++) {
            p[k] += p[k - 1];
        }
        var u = this.getRandom() * p[this.K - 1];
        for (topic = 0; topic < p.length; topic++) {
            if (u < p[topic])
                break;
        }
        this.nw[this.documents[m][n]][topic]++;
        this.nd[m][topic]++;
        this.nwsum[topic]++;
        this.ndsum[m]++;
        return topic;
    }
    
    this.updateParams =function () {
        for (var m = 0; m < this.documents.length; m++) {
            for (var k = 0; k < this.K; k++) {
                this.thetasum[m][k] += (this.nd[m][k] + this.alpha) / (this.ndsum[m] + this.K * this.alpha);
            }
        }
        for (var k = 0; k < this.K; k++) {
            for (var w = 0; w < this.V; w++) {
                this.phisum[k][w] += (this.nw[w][k] + this.beta) / (this.nwsum[k] + this.V * this.beta);
            }
        }
        this.numstats++;
    }
    
    this.getTheta = function() {
        var theta = new Array(); for(var i=0;i<this.documents.length;i++) theta[i] = new Array();
        if (this.SAMPLE_LAG > 0) {
            for (var m = 0; m < this.documents.length; m++) {
                for (var k = 0; k < this.K; k++) {
                    theta[m][k] = this.thetasum[m][k] / this.numstats;
                }
            }
        } else {
            for (var m = 0; m < this.documents.length; m++) {
                for (var k = 0; k < this.K; k++) {
                    theta[m][k] = (this.nd[m][k] + this.alpha) / (this.ndsum[m] + this.K * this.alpha);
                }
            }
        }
        return theta;
    }
    
    this.getPhi = function () {
        var phi = new Array(); for(var i=0;i<this.K;i++) phi[i] = new Array();
        if (this.SAMPLE_LAG > 0) {
            for (var k = 0; k < this.K; k++) {
                for (var w = 0; w < this.V; w++) {
                    phi[k][w] = this.phisum[k][w] / this.numstats;
                }
            }
        } else {
            for (var k = 0; k < this.K; k++) {
                for (var w = 0; w < this.V; w++) {
                    phi[k][w] = (this.nw[w][k] + this.beta) / (this.nwsum[k] + this.V * this.beta);
                }
            }
        }
        return phi;
    }

    this.getRandom = function() {
        if (this.RANDOM_SEED) {
            // generate a pseudo-random number using a seed to ensure reproducable results.
            var x = Math.sin(this.RANDOM_SEED++) * 1000000;
            return x - Math.floor(x);
        } else {
            // use standard random algorithm.
            return Math.random();
        }
    }
}

module.exports = process;
