// Ciclo dia/noite acelerado, derivado do relógio real — sem estado salvo,
// consistente entre sessões e áreas. Ciclo de 12 minutos:
// ~7min de dia, ~1,5min de anoitecer, ~3min de noite, ~30s de amanhecer.
const CYCLE_MS    = 12 * 60 * 1000;
const DAY_END     = 0.58;
const NIGHT_START = 0.70;
const NIGHT_END   = 0.96;

export const DayNight = {
    phase() {
        return (Date.now() % CYCLE_MS) / CYCLE_MS;
    },

    isNight() {
        const p = this.phase();
        return p >= NIGHT_START && p < NIGHT_END;
    },

    // 0 (dia claro) → 1 (noite fechada), com transições suaves
    darkness() {
        const p = this.phase();
        if (p < DAY_END) return 0;
        if (p < NIGHT_START) return (p - DAY_END) / (NIGHT_START - DAY_END);
        if (p < NIGHT_END) return 1;
        return 1 - (p - NIGHT_END) / (1 - NIGHT_END);
    },
};
