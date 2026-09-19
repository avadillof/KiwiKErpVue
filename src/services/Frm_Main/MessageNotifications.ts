import { backendUrl } from '@/services/backendUrl';
import { useAuthStore } from '@/stores/authStore';
import axios from 'axios';

export type NotificationType = 'quote' | 'order' | 'delivery' | 'invoice' | 'verifactu' | 'security' | 'system' | 'other';

export interface NotificationMessage {
    pkid: number;
    type: NotificationType;
    title: string;
    body: string;
    read: boolean;
    createdAt: string;
    link?: string;
}

export interface MessageListResponse {
    messages: NotificationMessage[];
}

function authedConfig() {
    return useAuthStore().portalRequestConfig();
}

export async function getMessages(userPk: number): Promise<NotificationMessage[]> {
    const { data } = await axios.post<MessageListResponse>(
        backendUrl('/WebGetMessagesUser'),
        { pkid: userPk },
        authedConfig()
    );
    return (data.messages || []).map((m) => ({
        ...m,
        read: !!m.read,
        type: m.type || 'other'
    }));
}

export async function markMessageRead(userPk: number, messagePk: number): Promise<void> {
    await axios.post(backendUrl('/WebMarkMessageRead'), { pkid: userPk, messagePk }, authedConfig());
}

export async function markAllMessagesRead(userPk: number): Promise<void> {
    await axios.post(backendUrl('/WebMarkAllMessagesRead'), { pkid: userPk }, authedConfig());
}