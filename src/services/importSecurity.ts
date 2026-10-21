import { PERM } from './Frm_Main/permissions';

type PermissionReader = { hasPermission: (code: string) => boolean };

/** Import permission supplements ordinary editing; it never grants editing by itself. */
export function canImportMasterData(security: PermissionReader, resource: 'entities' | 'products'): boolean {
    const permissions = resource === 'entities'
        ? [PERM.ENTI_GEN_EDIT, PERM.ENTI_GEN_IMPORT]
        : [PERM.PROD_EDIT, PERM.PROD_IMPORT];
    return permissions.every(code => security.hasPermission(code));
}
