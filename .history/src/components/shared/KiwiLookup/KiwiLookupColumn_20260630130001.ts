export interface KiwiLookupColumn {

    /**
     * Nombre del campo del objeto.
     * Ejemplo: "code"
     */
    field: string;

    /**
     * Texto de la cabecera.
     */
    header: string;

    /**
     * Ancho de la columna.
     */
    width?: string;

    /**
     * Permite ordenar.
     */
    sortable?: boolean;

    /**
     * Visible u oculta.
     */
    visible?: boolean;
}