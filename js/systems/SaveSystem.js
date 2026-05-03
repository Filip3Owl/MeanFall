const KEY = 'statquest_save_v1';

export const SaveSystem = {

    save(slotIndex, playerData) {
        const slots = this.loadAll();
        slots[slotIndex] = {
            ...this._serialize(playerData),
            saveTimestamp: new Date().toISOString(),
            version: '1.0.0',
        };
        try {
            localStorage.setItem(KEY, JSON.stringify(slots));
            return true;
        } catch {
            return false;
        }
    },

    load(slotIndex) {
        const slots = this.loadAll();
        return slots[slotIndex] ?? null;
    },

    loadAll() {
        try {
            const raw = localStorage.getItem(KEY);
            const data = raw ? JSON.parse(raw) : {};
            return [data[0] ?? null, data[1] ?? null, data[2] ?? null];
        } catch {
            return [null, null, null];
        }
    },

    delete(slotIndex) {
        const slots = this.loadAll();
        slots[slotIndex] = null;
        localStorage.setItem(KEY, JSON.stringify(slots));
    },

    autoSave(playerData) {
        this.save(0, playerData);
    },

    hasAnySave() {
        return this.loadAll().some(s => s !== null);
    },

    _serialize(player) {
        // Strip any non-serializable fields
        const { scene, sprite, ...rest } = player;
        return rest;
    },
};
