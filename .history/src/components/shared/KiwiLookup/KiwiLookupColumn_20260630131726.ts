export interface KiwiLookupColumn {

    /**
     * Nombre del campo del objeto.
     * Ejemplo:
     *  "code"
     *  "description"
     *  "salesTarifasDsCode"
     */
    field: string;

    /**
     * Texto que aparecerá en el encabezado.
     */
    header: string;

    /**
     * Permite ordenar la columna.
     */
    sortable?: boolean;

    /**
     * Permite filtrar la columna.
     */
    filter?: boolean;

    /**
     * Ancho de la columna.
     * Ejemplo:
     * "120px"
     * "20rem"
     */
    width?: string;

    /**
     * Alineación del contenido.
     */
    align?: 'left' | 'center' | 'right';

    /**
     * Oculta la columna.
     */
    hidden?: boolean;

}