const API = import.meta.env.VITE_API_URL


/**
 * ============================================
 * CARGAR PERMISOS DE UNA SECCIÓN
 * ============================================*/

export async function getSecurityAttributesUser(
    userPk: number,
    categoryPk: number
) {

    const response = await fetch(

        `${API}/WebGetSecurityAttributesUser`,

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


export async function updateModuleUser(
    userPk: number,
    securityPk: number,
    active: boolean
) {

    await fetch(`${API}/WebUpdateSecurityModuleUser`, {

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