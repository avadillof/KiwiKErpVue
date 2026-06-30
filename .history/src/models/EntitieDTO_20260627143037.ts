public class EntitieDTO {
    // Datos básicos (tabla entitie)
    private Long pkid;
    private String dsName;
    private String dsCode;
    private String dsCif;
    private Boolean bolClient;
    private Boolean bolSupplier;
    private Boolean isActive;

    // Atributos de ventas (tabla entitie_attributes_sales)
    private SalesAttributesDTO salesAttributes;

    // Atributos de compras (tabla entitie_attributes_purchases)
    private PurchasesAttributesDTO purchasesAttributes;

    // Getters y Setters...
}