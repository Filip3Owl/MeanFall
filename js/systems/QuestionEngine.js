import { QUESTIONS } from '../data/questions.js';

export const QuestionEngine = {

    getQuestion(topic, allowedDifficulties, mastery, recentIds = []) {
        const pool = (QUESTIONS[topic] || []).filter(q =>
            allowedDifficulties.includes(q.difficulty) &&
            !recentIds.includes(q.id)
        );

        if (pool.length === 0) {
            // Fallback: ignore recentIds filter
            return this._pickFrom(QUESTIONS[topic] || [], mastery);
        }

        return this._pickFrom(pool, mastery);
    },

    _pickFrom(pool, mastery) {
        if (pool.length === 0) return null;
        const wrongIds = mastery?.wrongIds || [];
        const wrong  = pool.filter(q => wrongIds.includes(q.id));
        const fresh  = pool.filter(q => !wrongIds.includes(q.id));

        // 60% bias toward previously wrong questions
        const usePool = (wrong.length > 0 && Math.random() < 0.6) ? wrong
            : fresh.length > 0 ? fresh : pool;

        return usePool[Math.floor(Math.random() * usePool.length)];
    },

    checkAnswer(question, userAnswer) {
        if (question.type === 'fill_numeric') {
            const parsed = parseFloat(String(userAnswer).replace(',', '.'));
            if (isNaN(parsed)) return false;
            return Math.abs(parsed - question.correctAnswer) <= (question.tolerance ?? 0);
        }
        return String(userAnswer).trim() === String(question.correctAnswer).trim();
    },

    shuffleOptions(question) {
        if (!question.options) return question;
        const shuffled = [...question.options].sort(() => Math.random() - 0.5);
        return { ...question, options: shuffled };
    },
};
