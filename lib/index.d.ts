interface LdaTerm {
  term: string;
  probability: number;
}
declare type LdaProcess = (sentences: string[], numberOfTopics: number, numberOfTermsPerTopics: number, languages?: string[], alphaValue?: number, betaValue?: number, randomSeed?: number) => LdaTerm[][];
declare module 'lda' {
  function lda(sentences: string[], numberOfTopics: number, numberOfTermsPerTopics: number, languages?: string[], alphaValue?: number, betaValue?: number, randomSeed?: number): LdaTerm[][]
  export = lda;
}