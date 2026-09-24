import { defineStore } from 'pinia';
import { useAuthStore } from '@/stores/authStore';
import { getMessages, markAllMessagesRead, markMessageRead, type NotificationMessage } from '@/services/Frm_Main/MessageNotifications';

export const useMessagesStore = defineStore('messages', {
    state: () => ({
        messages: [] as NotificationMessage[],
        loading: false,
        loaded: false,
        /** Se incrementa cuando el sondeo detecta mensajes nuevos. Las vistas lo observan para refrescarse. */
        feedVersion: 0,
        lastSeenPkid: 0
    }),

    getters: {
        unreadCount(state): number {
            return state.messages.filter((m) => !m.read).length;
        }
    },

    actions: {
        async loadMessages(force = false) {
            const authStore = useAuthStore();
            if (!authStore.user || (this.loading && !force)) return;
            if (this.loaded && !force) return;

            this.loading = true;
            try {
                this.messages = await getMessages(authStore.user.pkid);
                const maxPkid = this.messages.reduce((m, x) => Math.max(m, Number(x.pkid ?? 0)), 0);
                if (this.lastSeenPkid > 0 && maxPkid > this.lastSeenPkid) {
                    this.feedVersion++;
                }
                if (maxPkid > 0) {
                    this.lastSeenPkid = Math.max(this.lastSeenPkid, maxPkid);
                }
                this.loaded = true;
            } catch {
                this.loaded = this.loaded || this.messages.length > 0;
            } finally {
                this.loading = false;
            }
        },

        async markRead(message: NotificationMessage) {
            const authStore = useAuthStore();
            if (!authStore.user || message.read) return;

            this.messages = this.messages.map((m) =>
                m.pkid === message.pkid ? { ...m, read: true } : m
            );

            try {
                await markMessageRead(authStore.user.pkid, message.pkid);
            } catch {
                this.loadMessages(true);
            }
        },

        async markAllRead() {
            const authStore = useAuthStore();
            if (!authStore.user || this.unreadCount === 0) return;

            const previous = this.messages;
            this.messages = this.messages.map((m) => ({ ...m, read: true }));

            try {
                await markAllMessagesRead(authStore.user.pkid);
            } catch {
                this.messages = previous;
            }
        },

        clear() {
            this.messages = [];
            this.loaded = false;
            this.feedVersion = 0;
            this.lastSeenPkid = 0;
        }
    }
});