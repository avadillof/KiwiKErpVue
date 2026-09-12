import { backendUrl } from '@/services/backendUrl';
/**
 * ============================================
 * CARGAR PERMISOS DE UNA SECCIÓN
 * ============================================*/

export async function getSecurityAttributesUser(
    userPk: number,
    categoryPk: number
) {

    const response = await fetch(

        backendUrl(`/WebGetSecurityAttributesUser`),

        {

            method: 'POST',

            headers: {
                'Content-Type': 'application/json'
            },

            body: JSON.stringify({

                userPk,
                categoryPk

            })

        }

    )

    if (!response.ok) {
        throw new Error("Error cargando permisos")
    }

    return await response.json()

}



export async function updatePermissionUser(
    userPk: number,
    attributePk: number,
    active: boolean
) {

    await fetch(backendUrl(`/WebUpdateSecurityPermission`), {

        method: 'POST',

        headers: {
            'Content-Type': 'application/json'
        },

        body: JSON.stringify({

            userPk,
            attributePk,
            active

        })

    })

}

export async function updateModuleUser(
    userPk: number,
    securityPk: number,
    active: boolean
) {

    await fetch(backendUrl(`/WebUpdateSecurityModuleUser`), {

        method: 'POST',

        headers: {
            'Content-Type': 'application/json'
        },

        body: JSON.stringify({

            userPk,
            securityPk,
            active

        })

    })







}