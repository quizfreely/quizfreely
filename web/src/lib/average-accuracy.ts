/* returns average term accuracy from term & def correct/incorrect counts.

averages defined values and leaves out undefined values,
but it will return NaN if both term & def counts are null,
so call it if at least one of them is defined
(only call it if term.progress is populated)

for example, use this condition before calling averageAccuracy:
```js
if (term.progress && (
    term.progress.termCorrectCount > 0 ||
    term.progress.termIncorrectCount > 0 ||
    term.progress.defCorrectCount > 0 ||
    term.progress.defIncorrectCount > 0
)) {
    console.log(averageAccuracy(
        term.progress.termCorrectCount,
        term.progress.termIncorrectCount,
        term.progress.defCorrectCount,
        term.progress.defIncorrectCount
    ) + "%");
}
*/
export default function averageAccuracy(tc: number, ti: number, dc: number, di: number) {
    /* tc = termCorrect, ti = termIncorrect,
    dc = defCorrect, di = defIncorrect */
    let avg = 0;
    let counts = 0;
    if (tc + ti > 0) {
        avg += tc / (tc+ti);
        counts++;
    }
    if (dc + di > 0) {
        avg += dc / (dc+di);
        counts++;
    }
    if (counts === 0) return 0;
    return Math.floor((avg / counts) * 100);
}
