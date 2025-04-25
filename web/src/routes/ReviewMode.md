# Review Mode

Quizfreely stores terms in a (rectangular) 2D array:
```json
{
    terms: [
        ["term 1", "definition 1"],
        ["term 2", "def 2"],
        ["term 3", "def 3"]
    ]
}
```

Multiple users can review the same studyset, but they will all have different progress, so progress/accuracy/scores are in a different array. 

This per-user array of objects records how many times a correct/incorrect term or definition was answered with `termCorrect`, `termIncorrect`, `defCorrect`, and `defIncorrect`. Answering with a term and answering with a definition might require a different process or different skills depending on what a user is studying, so Quizfreely records answering-with-term and answering-with-def accuracy seperately.
```json
{
    termProgress: [
        {
            term: "term 1",
            def: "definition 1",
            termCorrect: 1,
            termIncorrect: 6,
            defCorrect: 1,
            defIncorrect: 0,
            firstReviewedAt: "2009-01-19 Jan W4-1 Mon 00:59 GMT-5 EST",
            lastReviewedAt: "2025-01-19 Jan W3-1 Mon 00:59 GMT-5 EST"
        },
        {
            term: "term 3",
            def: "def 3",
            termCorrect: 9,
            termIncorrect: 4,
            defCorrect: 8,
            defIncorrect: 2,
            firstReviewedAt: "2022-12-13 Dec W50-2 Tue 16:23 GMT-5 EST"
            lastReviewedAt: "2025-04-24 Apr W17-4 Thu 22:12 GMT-4 EDT"
        }
    ]
}
```
