import axios from 'axios';
import { backendUrl } from '@/services/backendUrl';
import type { TaskCommentDTO, TaskDTO } from './taskService';

const TOKEN_KEY = 'kiwik.portal.token';

export function portalToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setPortalToken(token: string | null) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* sin almacenamiento */
  }
}

export interface PortalSession {
  contactPkid: number;
  contactName: string;
  entitiePkid: number;
  entitieName: string;
  token: string;
}

export async function requestPortalLink(email: string): Promise<void> {
  const portalBase = window.location.origin;
  await axios.post(backendUrl('/WebRequestPortalLink'), { email, portalBase });
}

export async function portalSession(token: string): Promise<PortalSession> {
  const { data } = await axios.get(backendUrl('/WebPortalSession'), { params: { token } });
  return data as PortalSession;
}

export async function portalLogout(token: string): Promise<void> {
  try {
    await axios.post(backendUrl('/WebPortalLogout'), { token });
  } catch {
    /* cierra igual en local */
  }
  setPortalToken(null);
}

async function portalTasks(token: string): Promise<TaskDTO[]> {
  try {
    const { data } = await axios.get(backendUrl('/WebPortalTasks'), { params: { token } });
    return (Array.isArray(data) ? data : []) as TaskDTO[];
  } catch (e: any) {
    if (e?.response?.status === 404 || e?.response?.status === 204) return [];
    throw e;
  }
}

export { portalTasks };

export async function portalTask(token: string, pkid: number): Promise<TaskDTO> {
  const { data } = await axios.get(backendUrl('/WebPortalTask'), { params: { token, pkid } });
  return data as TaskDTO;
}

export async function portalComments(token: string, taskPkid: number): Promise<TaskCommentDTO[]> {
  try {
    const { data } = await axios.get(backendUrl('/WebPortalTaskComments'), { params: { token, taskPkid } });
    return (Array.isArray(data) ? data : []) as TaskCommentDTO[];
  } catch (e: any) {
    if (e?.response?.status === 404 || e?.response?.status === 204) return [];
    throw e;
  }
}

export async function portalSendComment(token: string, taskPkid: number, text: string): Promise<TaskCommentDTO> {
  const { data } = await axios.post(backendUrl('/WebPortalTaskComment'), { token, taskPkid, text });
  return data as TaskCommentDTO;
}

export async function portalCreateTask(input: {
  token: string;
  name: string;
  description?: string;
  userPkid?: number | null;
  contactPkid?: number | null;
}): Promise<TaskDTO> {
  const { data } = await axios.post(backendUrl('/WebPortalCreateTask'), input);
  return data as TaskDTO;
}

export interface PortalContact {
  pkid: number;
  name: string;
}

export async function portalEntitieContacts(token: string): Promise<PortalContact[]> {
  try {
    const { data } = await axios.get(backendUrl('/WebPortalEntitieContacts'), { params: { token } });
    return (Array.isArray(data) ? data : []) as PortalContact[];
  } catch (e: any) {
    if (e?.response?.status === 404 || e?.response?.status === 204) return [];
    throw e;
  }
}

export interface PortalDoc {
  name: string;
  extension: string;
  size: number;
}

export async function portalTaskDocuments(token: string, taskPkid: number): Promise<PortalDoc[]> {
  try {
    const { data } = await axios.get(backendUrl('/WebPortalTaskDocuments'), { params: { token, taskPkid } });
    return (Array.isArray(data) ? data : []) as PortalDoc[];
  } catch (e: any) {
    if (e?.response?.status === 404 || e?.response?.status === 204) return [];
    throw e;
  }
}

export async function portalUploadTaskDocuments(token: string, taskPkid: number, files: File[]): Promise<PortalDoc[]> {
  const form = new FormData();
  form.append('token', token);
  form.append('taskPkid', String(taskPkid));
  files.forEach((f) => form.append('files', f));
  const { data } = await axios.post(backendUrl('/WebPortalTaskDocument'), form, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return (Array.isArray(data) ? data : []) as PortalDoc[];
}

export async function portalDownloadTaskDocument(token: string, taskPkid: number, fileName: string): Promise<void> {
  const { data } = await axios.get(backendUrl('/WebPortalTaskDocumentDownload'), {
    params: { token, taskPkid, fileName },
    responseType: 'blob'
  });
  const url = window.URL.createObjectURL(data);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

export async function portalDeleteTaskDocument(token: string, taskPkid: number, fileName: string): Promise<void> {
  await axios.delete(backendUrl('/WebPortalTaskDocument'), { params: { token, taskPkid, fileName } });
}

export interface PortalNotification {
  notificationKyId: number;
  contactPkid: number;
  taskPkid: number | null;
  type: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: string | null;
  link: string;
  key: string;
}

export async function portalNotifications(token: string): Promise<PortalNotification[]> {
  try {
    const { data } = await axios.get(backendUrl('/WebPortalNotifications'), { params: { token } });
    return (Array.isArray(data) ? data : []) as PortalNotification[];
  } catch (e: any) {
    if (e?.response?.status === 404 || e?.response?.status === 204) return [];
    throw e;
  }
}

export async function portalNotificationsUnread(token: string): Promise<number> {
  try {
    const { data } = await axios.get(backendUrl('/WebPortalNotificationsUnread'), { params: { token } });
    return Number(data?.unread ?? 0);
  } catch {
    return 0;
  }
}

export async function portalNotificationsRead(token: string, ids?: number[]): Promise<void> {
  await axios.post(backendUrl('/WebPortalNotificationsRead'), { token, ids: ids ?? null });
}

export async function portalChangeTaskState(token: string, taskPkid: number, state: string): Promise<TaskDTO> {
  const { data } = await axios.post(backendUrl('/WebPortalTaskState'), { token, taskPkid, state });
  return data as TaskDTO;
}
