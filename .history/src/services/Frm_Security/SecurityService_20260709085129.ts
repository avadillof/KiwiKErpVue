const API = import.meta.env.VITE_API_URL





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