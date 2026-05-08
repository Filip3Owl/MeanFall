// QuestionGenerator — randomised fill_numeric variants
// Each entry is keyed by question ID and returns partial overrides
// { questionText?, context?, correctAnswer, tolerance? }
// that are merged onto the base question from questions.js.
// Multiple-choice questions are NOT generated here — shuffleOptions() handles those.

// ── Helpers ────────────────────────────────────────────────────────────────
const ri = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const r2 = x => Math.round(x * 100) / 100;
const r1 = x => Math.round(x * 10) / 10;

function mean(a)   { return a.reduce((s, v) => s + v, 0) / a.length; }
function median(a) {
    const s = [...a].sort((x, y) => x - y), m = s.length >> 1;
    return s.length & 1 ? s[m] : r2((s[m - 1] + s[m]) / 2);
}
function mode(a) {
    const f = {};
    a.forEach(v => { f[v] = (f[v] || 0) + 1; });
    return +Object.entries(f).sort((p, q) => q[1] - p[1])[0][0];
}
function popVar(a) {
    const m = mean(a);
    return r2(a.reduce((s, v) => s + (v - m) ** 2, 0) / a.length);
}
function sampleVar(a) {
    const m = mean(a);
    return r2(a.reduce((s, v) => s + (v - m) ** 2, 0) / (a.length - 1));
}

// ── MÉDIA / MEDIANA / MODA ─────────────────────────────────────────────────

export const GENERATORS = {

    // mean of 10 random values
    mmm_001: () => {
        const vals = Array.from({ length: 10 }, () => ri(1, 15));
        return {
            context: `Danos: [${vals.join(', ')}]. Calcule a MÉDIA de dano por batalha.`,
            correctAnswer: r2(mean(vals)),
            tolerance: 0.1,
        };
    },

    // mean of 5 values in arithmetic sequence (always exact integer)
    mmm_004: () => {
        const a = ri(5, 20), d = ri(5, 20);
        const vals = [a, a + d, a + 2 * d, a + 3 * d, a + 4 * d];
        return {
            questionText: `Cinco amuletos custam: ${vals.join(', ')} gemas. Qual é o preço MÉDIO?`,
            correctAnswer: a + 2 * d,   // exact mean of arithmetic sequence
            tolerance: 0.01,
        };
    },

    // median of 5 strictly ascending values
    mmm_005: () => {
        const base = ri(5, 15);
        const vals = [base, base + ri(1, 4), base + ri(5, 9), base + ri(10, 14), base + ri(15, 20)];
        return {
            questionText: `Os HPs dos 5 inimigos derrotados foram: [${vals.join(', ')}]. Qual é a MEDIANA?`,
            correctAnswer: vals[2],
            tolerance: 0,
        };
    },

    // median of 7 unsorted values
    mmm_007: () => {
        const vals = Array.from({ length: 7 }, () => ri(1, 15));
        return {
            context: `Danos: [${vals.join(', ')}]`,
            correctAnswer: median(vals),
            tolerance: 0,
        };
    },

    // mean with strong outlier — shows distortion
    mmm_010: () => {
        const base = ri(800, 1800), step = ri(150, 400);
        const outlier = ri(8000, 20000);
        const vals = [base, base + step, base + 2 * step, base + 3 * step, outlier];
        return {
            questionText: `A guilda paga em ouro: [${vals.join(', ')}]. Qual é a MÉDIA paga?`,
            correctAnswer: r2(mean(vals)),
            tolerance: 2,
        };
    },

    // mean of 6 values
    mmm_012: () => {
        const vals = Array.from({ length: 6 }, () => ri(8, 28));
        return {
            questionText: `Em 6 batalhas, seus tempos (em segundos) foram: [${vals.join(', ')}]. Calcule a MÉDIA.`,
            correctAnswer: r2(mean(vals)),
            tolerance: 0.1,
        };
    },

    // median of 4 values (even count → average of two middle)
    mmm_013: () => {
        const vals = Array.from({ length: 4 }, () => ri(1, 10)).sort((a, b) => a - b);
        return {
            questionText: `A guilda recrutou 4 magos de níveis [${vals.join(', ')}]. Qual é a MEDIANA?`,
            correctAnswer: median(vals),
            tolerance: 0.1,
        };
    },

    // mode of 6 values — one value appears 3×, others appear less
    mmm_014: () => {
        const mv = ri(6, 14) * 10; // mode value: 60, 70, 80 ... 140
        const a = mv - ri(1, 3) * 10, b = mv + ri(1, 3) * 10;
        const vals = [a, mv, b, mv, mv, a];  // mv appears 3×
        return {
            questionText: `O ferreiro vendeu 6 espadas por: [${vals.join(', ')}] gemas. Qual é a MODA?`,
            correctAnswer: mv,
            tolerance: 0,
        };
    },

    // weighted mean of two groups
    mmm_016: () => {
        const nA = ri(2, 5), dmgA = ri(8, 15);
        const nB = ri(1, 4), dmgB = dmgA + ri(5, 15);
        const wm = r1((nA * dmgA + nB * dmgB) / (nA + nB));
        return {
            questionText: `Sua equipe tem ${nA} guerreiros com dano médio ${dmgA} e ${nB} magos com dano médio ${dmgB}. Qual o dano médio de TODA a equipe?`,
            correctAnswer: wm,
            tolerance: 0.1,
        };
    },

    // median of 4 arithmetic values
    mmm_019: () => {
        const a = ri(3, 10), d = ri(3, 8);
        const vals = [a, a + d, a + 2 * d, a + 3 * d];
        return {
            questionText: `Quatro poções custam ${vals.join(', ')} gemas. Qual é a MEDIANA?`,
            correctAnswer: median(vals),
            tolerance: 0.1,
        };
    },

    // mode of 6 drops
    mmm_021: () => {
        const mv = ri(2, 8) * 5; // 10, 15, 20 ... 40
        const x = mv - ri(1, 2) * 5, y = mv + ri(1, 2) * 5;
        const vals = [mv, x, mv, y, mv, y];  // mv appears 3×
        return {
            questionText: `Um bando deixou cair bolsas de ouro com os valores: ${vals.join(', ')}. Qual é a MODA de ouro por bolsa?`,
            correctAnswer: mv,
            tolerance: 0,
        };
    },

    // mean of 5 values
    mmm_022: () => {
        const vals = Array.from({ length: 5 }, () => ri(20, 100));
        return {
            questionText: `Você encontrou 5 poções de mana. Seus volumes em ml são: ${vals.join(', ')}. Qual é a MÉDIA de volume?`,
            correctAnswer: r2(mean(vals)),
            tolerance: 0.5,
        };
    },

    // median of 6 unsorted values
    mmm_023: () => {
        const vals = Array.from({ length: 6 }, () => ri(1, 12));
        return {
            questionText: `Um grupo de 6 Golems tem os seguintes pesos em toneladas: ${vals.join(', ')}. Qual é a MEDIANA de peso?`,
            correctAnswer: median(vals),
            tolerance: 0.1,
        };
    },

    // find missing value given target mean
    mmm_026: () => {
        const base = Array.from({ length: 4 }, () => ri(1, 8));
        const baseSum = base.reduce((s, v) => s + v, 0);
        const targetMean = ri(4, 8);
        const missing = targetMean * 5 - baseSum;
        if (missing < 1 || missing > 20) {
            // regenerate with safe values
            const safeBase = [1, 2, 4, 5]; // original question values
            return {
                questionText: `O Pastor tem 4 ovelhas de níveis ${safeBase.join(', ')}. Ele compra uma 5ª e a MÉDIA de nível sobe para 4. Qual o nível da nova ovelha?`,
                correctAnswer: 8, tolerance: 0,
            };
        }
        return {
            questionText: `O Pastor tem 4 ovelhas de níveis ${base.join(', ')}. Ele compra uma 5ª e a MÉDIA sobe para ${targetMean}. Qual o nível da nova ovelha?`,
            correctAnswer: missing,
            tolerance: 0,
        };
    },

    // ── VARIÂNCIA / DESVIO PADRÃO ──────────────────────────────────────────

    // amplitude of 6 values
    spr_001: () => {
        const vals = Array.from({ length: 6 }, () => ri(1, 30));
        return {
            questionText: `Os HPs dos monstros encontrados foram: [${vals.join(', ')}]. Qual é a AMPLITUDE?`,
            correctAnswer: Math.max(...vals) - Math.min(...vals),
            tolerance: 0,
        };
    },

    // amplitude of 5 values
    spr_003: () => {
        const vals = Array.from({ length: 5 }, () => ri(1, 20));
        return {
            questionText: `Preços de poções na loja: [${vals.join(', ')}]. Qual é a AMPLITUDE?`,
            correctAnswer: Math.max(...vals) - Math.min(...vals),
            tolerance: 0,
        };
    },

    // population variance — symmetric pairs ensure exact mean
    spr_005: () => {
        const m = ri(3, 8);
        const devs = [ri(1, 3), ri(1, 3), ri(1, 4), ri(2, 4)]; // 4 positive deviations
        const vals = [...devs.map(d => m - d), ...devs.map(d => m + d)].sort((a, b) => a - b);
        const v = r2(devs.reduce((s, d) => s + 2 * d * d, 0) / 8);
        return {
            context: `Danos: [${vals.join(', ')}]. A média é ${m}. Calcule a VARIÂNCIA POPULACIONAL.`,
            correctAnswer: v,
            tolerance: 0.1,
        };
    },

    // population std dev = sqrt(variance from spr_005 logic)
    spr_006: () => {
        const m = ri(3, 8);
        const devs = [ri(1, 3), ri(1, 3), ri(1, 4), ri(2, 4)];
        const vals = [...devs.map(d => m - d), ...devs.map(d => m + d)].sort((a, b) => a - b);
        const v = devs.reduce((s, d) => s + 2 * d * d, 0) / 8;
        return {
            context: `Danos: [${vals.join(', ')}]. A média é ${m}. Calcule o DESVIO PADRÃO POPULACIONAL.`,
            correctAnswer: r2(Math.sqrt(v)),
            tolerance: 0.1,
        };
    },

    // sample variance of 5 values (divisor n−1)
    spr_009: () => {
        const m = ri(3, 8);
        const devs = [ri(1, 3), ri(1, 3), 0]; // 5 values: m-d1, m-d2, m, m+d2, m+d1
        // Actually build 5 symmetric values: m-d2, m-d1, m, m+d1, m+d2
        const d1 = ri(1, 3), d2 = ri(1, 3);
        const vals = [m - d2, m - d1, m, m + d1, m + d2];
        const sv = r2(sampleVar(vals));
        return {
            questionText: `Calcule a VARIÂNCIA AMOSTRAL dos seus drops: [${vals.join(', ')}] (use n−1).`,
            correctAnswer: sv,
            tolerance: 0.1,
        };
    },

    // population std dev of 5 values with known mean
    spr_011: () => {
        const m = ri(3, 8);
        const d1 = ri(1, 3), d2 = ri(2, 4);
        const vals = [m - d2, m - d1, m, m + d1, m + d2];
        const v = (2 * d1 * d1 + 2 * d2 * d2) / 5;
        return {
            questionText: `Os tempos de cast (em segundos) de 5 magias foram: [${vals.join(', ')}]. Média = ${m}. Calcule o DESVIO PADRÃO POPULACIONAL.`,
            correctAnswer: r2(Math.sqrt(v)),
            tolerance: 0.05,
        };
    },

    // CV = (sigma / mean) * 100
    spr_014: () => {
        const m2 = ri(5, 20) * 10;         // mean 50–200
        const s2 = ri(1, Math.floor(m2 / 5)); // sigma < mean/5
        const cv = r1((s2 / m2) * 100);
        return {
            questionText: `Uma poção tem cura média ${m2} com desvio padrão ${s2}. Qual o COEFICIENTE DE VARIAÇÃO (em %)?`,
            correctAnswer: cv,
            tolerance: 0.2,
        };
    },

    // amplitude of 5 values (easy)
    spr_018: () => {
        const vals = Array.from({ length: 5 }, () => ri(3, 18));
        return {
            questionText: `Os danos dos seus 5 últimos ataques foram: [${vals.join(', ')}]. Qual é a AMPLITUDE desse conjunto?`,
            correctAnswer: Math.max(...vals) - Math.min(...vals),
            tolerance: 0,
        };
    },

    // population variance of 3 values
    spr_022: () => {
        const m = ri(5, 12);
        const d = ri(1, 4);
        const vals = [m - d, m, m + d]; // mean exactly m
        const v = r2(2 * d * d / 3);
        return {
            questionText: `Você testou uma nova varinha. Os danos foram: ${vals.join(', ')}. A média é ${m}. Qual é a VARIÂNCIA POPULACIONAL desse conjunto?`,
            correctAnswer: v,
            tolerance: 0.1,
        };
    },

    // stddev = sqrt(variance) — uses a perfect square
    spr_023: () => {
        const sqrts  = [1, 2, 3, 4, 5, 6, 7, 8];
        const sd     = sqrts[ri(0, sqrts.length - 1)];
        const v      = sd * sd;
        const nMonst = ri(3, 8);
        return {
            questionText: `Um grupo de ${nMonst} Specters tem variância de HP igual a ${v}. Qual é o DESVIO PADRÃO de HP desse grupo?`,
            correctAnswer: sd,
            tolerance: 0,
        };
    },

    // IQR of 4 ascending values: Q1 = avg(v[0],v[1]), Q3 = avg(v[2],v[3])
    spr_025: () => {
        const a = ri(1, 4), d = ri(1, 4);
        const vals = [a, a + d, a + 2 * d, a + 3 * d]; // arithmetic seq
        const q1   = r2((vals[0] + vals[1]) / 2);
        const q3   = r2((vals[2] + vals[3]) / 2);
        return {
            questionText: `Os níveis de perigo de 4 trilhas são: ${vals.join(', ')}. Qual é o INTERVALO INTERQUARTIL (IQR)?`,
            correctAnswer: r2(q3 - q1),
            tolerance: 0.1,
        };
    },

    // ── PROBABILIDADE ──────────────────────────────────────────────────────

    // P = red / total (gem bag)
    prob_001: () => {
        const total = ri(6, 15);
        const red   = ri(1, total - 1);
        return {
            questionText: `Um baú contém ${red} gemas vermelhas e ${total - red} azuis. Qual a probabilidade de tirar uma VERMELHA?`,
            correctAnswer: r2(red / total),
            tolerance: 0.01,
        };
    },

    // P = 1/n (equal-sector spinner)
    prob_002: () => {
        const sectors = ri(3, 8);
        const sector  = ['poção', 'ouro', 'gema', 'vazio', 'espada', 'chave', 'mapa'][ri(0, 6)];
        return {
            questionText: `Você gira a Roda da Sorte com ${sectors} setores iguais. Qual a chance de cair no setor "${sector}"?`,
            correctAnswer: r2(1 / sectors),
            tolerance: 0.01,
        };
    },

    // P(even on d6 or similar die)
    prob_005: () => {
        const faces   = [4, 6, 8, 10, 12][ri(0, 4)];
        const favored = Math.floor(faces / 2);
        return {
            questionText: `Você lança um dado de ${faces} faces. Qual a probabilidade de tirar um número PAR?`,
            correctAnswer: r2(favored / faces),
            tolerance: 0.01,
        };
    },

    // P(A∪B) = P(A) + P(B) - P(A∩B)
    prob_006: () => {
        const pA   = ri(2, 5) / 10;      // 0.2 – 0.5
        const pB   = ri(2, 5) / 10;
        const pAB  = r2(ri(0, Math.floor(Math.min(pA, pB) * 10)) / 10); // ≤ min(pA,pB)
        const pUnion = r2(pA + pB - pAB);
        return {
            questionText: `O dragão tem ${pA * 100}% de chance de cuspir fogo (A) e ${pB * 100}% de bater asas (B). Há ${pAB * 100}% de fazer AMBOS. Qual P(A∪B)?`,
            correctAnswer: pUnion,
            tolerance: 0.01,
        };
    },

    // Conditional probability without replacement
    prob_008: () => {
        const fire = ri(3, 7), ice = ri(2, 5);
        const total = fire + ice;
        const pCond = r2(ice / (total - 1)); // P(ice on 2nd | fire on 1st)
        return {
            questionText: `Você tira 2 cartas SEM reposição de ${total} cartas (${fire} de fogo, ${ice} de gelo). Qual P(gelo na 2ª | fogo na 1ª)?`,
            correctAnswer: pCond,
            tolerance: 0.01,
        };
    },
};
