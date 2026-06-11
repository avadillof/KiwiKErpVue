const fetchTime = async () => {
    try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/system/time`);
        const rawDate = response.data.serverTime;
        
        // Validación crítica
        const parsedDate = new Date(rawDate);
        if (isNaN(parsedDate.getTime())) {
            console.error("Formato de fecha inválido recibido de la API:", rawDate);
            serverTime.value = new Date(); // Fallback a la hora local si el server falla
        } else {
            serverTime.value = parsedDate;
        }
    } catch (error) {
        console.error("Error al sincronizar hora:", error);
    }
};