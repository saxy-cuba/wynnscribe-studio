import { create } from 'zustand';

interface TranslationState {
    changes: Record<number, string>;
    setChange: (id: number, value: string) => void;
    removeChange: (id: number) => void;
    clearChanges: () => void;
    hasChanges: () => boolean;
}

export const useTranslationStore = create<TranslationState>()((set, get) => ({
    changes: {},

    setChange: (id, value) => {
        set((state) => ({
            changes: {
                ...state.changes,
                [id]: value
            }
        }));
    },

    removeChange: (id) => {
        set((state) => {
            const newChanges = { ...state.changes };
            delete newChanges[id];
            return { changes: newChanges };
        });
    },

    clearChanges: () => {
        set({ changes: {} });
    },

    hasChanges: () => {
        return Object.keys(get().changes).length > 0;
    },
}));