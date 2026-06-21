// src/types/UserTypes.ts
export interface UserFormData {
    pkid: number;
    userDsCode: string;
    name: string;
    email: string;
    password: string;
    groupKyId: number;
    active: boolean;
    pin: string;
    userDtDateUp: Date | null;
    profilePhoto: string | undefined;
}