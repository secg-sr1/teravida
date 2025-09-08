// /api/chat/helpers.mjs

export const isEveryNth = (n, k) => k > 0 && k % n === 0; // k = número de turnos del usuario

export const chipsLine = (chips) => chips.join(' '); // "[A] [B] [C] …"
