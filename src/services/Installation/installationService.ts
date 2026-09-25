import { backendUrl } from '@/services/backendUrl';
export type InstallationStatus =
    | 'NEW'
    | 'DATABASE_EXISTS'
    | 'IN_PROGRESS'
    | 'COMPLETED'
    | 'ERROR';

export interface InstallationState {
    status: InstallationStatus;
    currentStep?: number;
    installationId?: string;
    schemaVersion?: string;
    message?: string;
    deploymentMode?: 'STANDARD_CLOUD' | 'CUSTOM_CLOUD' | 'ON_PREMISE';
    documentRootManaged?: boolean;
    documentRoot?: string;
    configurationRequired?: boolean;
    activationPending?: boolean;
}

export interface CompanyInstallationData {
    legalName: string;
    tradeName: string;
    taxId: string;
    email: string;
    phone: string;
    address: string;
    addressNumber: string;
    postalCode: string;
    city: string;
    province: string;
    country: string;
    slogan: string;
    logo: File | null;
}

export interface AdministratorInstallationData {
    name: string;
    username: string;
    email: string;
    password: string;
}

export interface InstallationCheckResult {
    ok: boolean;
    message: string;
    value?: string;
    databaseState?: 'EMPTY' | 'PREPARED' | 'RECREATE_REQUIRED';
    requiresRecreation?: boolean;
}


async function request<T>(path: string, options?: RequestInit): Promise<T> {
    const response = await fetch(backendUrl(`/api/installation${path}`), options);

    if (!response.ok) {
        const detail = await response.text();
        throw new Error(detail || `El instalador respondió con el estado ${response.status}.`);
    }

    return response.json() as Promise<T>;
}

export async function getInstallationState(): Promise<InstallationState> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    try {
        const response = await fetch(backendUrl(`/api/installation/status`), {
            headers: { Accept: 'application/json' },
            cache: 'no-store',
            signal: controller.signal
        });

        if (response.status === 404) {
            return {
                status: 'ERROR',
                message: 'El servicio de KiwiKERP no está disponible o no es compatible.'
            };
        }
        if (!response.ok) throw new Error(`Estado ${response.status}`);
        return (await response.json()) as InstallationState;
    } catch {
        // Una caída del servidor no debe confundirse con una instalación nueva.
        return { status: 'ERROR', message: 'No se ha podido comprobar el estado del servidor.' };
    } finally {
        clearTimeout(timeoutId);
    }
}

export function initialiseDatabase(): Promise<InstallationState> {
    return request<InstallationState>('/database', { method: 'POST' });
}

export function checkInstallationDatabase(): Promise<InstallationCheckResult> {
    return request<InstallationCheckResult>('/checks/database', { method: 'POST' });
}

export function recreateInstallationDatabase(confirmation: string): Promise<InstallationCheckResult> {
    return request<InstallationCheckResult>('/database/recreate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirmation })
    });
}

export function saveCompany(data: CompanyInstallationData): Promise<InstallationState> {
    const body = new FormData();
    Object.entries(data).forEach(([key, value]) => {
        if (value !== null) body.append(key, value);
    });
    return request<InstallationState>('/company', { method: 'POST', body });
}

export function saveAdministrator(data: AdministratorInstallationData): Promise<InstallationState> {
    return request<InstallationState>('/administrator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
}

export function completeInstallation(): Promise<InstallationState> {
    return request<InstallationState>('/complete', { method: 'POST' });
}
