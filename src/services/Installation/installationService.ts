export type InstallationStatus =
    | 'NEW'
    | 'IN_PROGRESS'
    | 'COMPLETED'
    | 'ERROR'
    | 'LEGACY';

export interface InstallationState {
    status: InstallationStatus;
    currentStep?: number;
    installationId?: string;
    schemaVersion?: string;
    message?: string;
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
}

const apiBaseUrl = import.meta.env.VITE_API_URL || '';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${apiBaseUrl}/api/installation${path}`, options);

    if (!response.ok) {
        const detail = await response.text();
        throw new Error(detail || `El instalador respondió con el estado ${response.status}.`);
    }

    return response.json() as Promise<T>;
}

export async function getInstallationState(): Promise<InstallationState> {
    try {
        const response = await fetch(`${apiBaseUrl}/api/installation/status`, {
            headers: { Accept: 'application/json' }
        });

        // Las instalaciones anteriores al asistente no tienen este endpoint.
        if (response.status === 404) return { status: 'LEGACY' };
        if (!response.ok) throw new Error(`Estado ${response.status}`);
        return (await response.json()) as InstallationState;
    } catch {
        // Una caída del servidor no debe confundirse con una instalación nueva.
        return { status: 'ERROR', message: 'No se ha podido comprobar el estado del servidor.' };
    }
}

export function initialiseDatabase(): Promise<InstallationState> {
    return request<InstallationState>('/database', { method: 'POST' });
}

export function checkInstallationDatabase(): Promise<InstallationCheckResult> {
    return request<InstallationCheckResult>('/checks/database', { method: 'POST' });
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
