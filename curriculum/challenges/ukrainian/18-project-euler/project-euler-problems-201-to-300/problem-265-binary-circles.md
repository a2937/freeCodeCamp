---
id: 5900f4761000cf542c50ff88
title: 'Завдання 265: бінарні кола'
challengeType: 1
forumTopicId: 301914
dashedName: problem-265-binary-circles
---

# --description--

$2^N$ бінарні цифри можна розмістити в колі так, щоб всі $N$-значні підпослідовності за годинниковою стрілкою відрізнялись.

За умови $N = 3$ можливі два таких кругових розміщення, ігноруючи обертання:

<img alt="два кругових розміщення за умови N = 3" src="https://cdn.freecodecamp.org/curriculum/project-euler/binary-circles.gif" style="background-color: white; padding: 10px; display: block; margin-right: auto; margin-left: auto; margin-bottom: 1.2rem;" />

Тризначними підпослідовностями за годинниковою стрілкою для першого розміщення є: 000, 001, 010, 101, 011, 111, 110 та 100.

Кожне кругове розміщення може бути зашифроване як число, об’єднавши всі бінарні цифри, починаючи з підпослідовності нулів як найбільш значущих бітів і продовжуючи за годинниковою стрілкою. Таким чином, два варіанти розміщення за умови $N = 3$ представлені як 23 та 29:

$${00010111}_2 = 23\\\\
{00011101}_2 = 29$$

Називаючи $S(N)$ сумою унікальних числових представлень, ми можемо побачити, що $S(3) = 23 + 29 = 52$.

Знайдіть $S(5)$.

# --hints--

`binaryCircles()` має повернути `209110240768`.

```js
assert.strictEqual(binaryCircles(), 209110240768);
```

# --seed--

## --seed-contents--

```js
function binaryCircles() {

  return true;
}

binaryCircles();
```

# --solutions--

```js
// solution required
```
