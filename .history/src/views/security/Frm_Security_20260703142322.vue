<template>
    <div class="p-4 h-screen flex flex-column" style="padding-bottom: 80px;">
        <h1 class="text-3xl font-extrabold text-gray-800 mb-1">Securización</h1>
        <Message variant="simple" icon="pi pi-info-circle" severity="success" class="mb-4">
            Configure la securización y accesos para el Usuario seleccionado.
        </Message>

        <div class="mb-4">
            <Button label="Volver al Panel" icon="pi pi-arrow-left" text @click="volverAlDashboard" />
        </div>

        <div class="flex-grow-1 border-1 surface-border border-round-lg overflow-hidden shadow-sm">
            
            <Splitter layout="vertical" class="h-full">
                
                <SplitterPanel :size="40" class="flex flex-column">
                    <SecurityModulesTable @select="onModuleSelected" />
                </SplitterPanel>
                
                <SplitterPanel :size="60" class="flex flex-column">
                    <Splitter layout="horizontal" class="h-full">
                        <SplitterPanel :size="50" class="flex flex-column">
                            <SecuritySectionsTable :module="selectedModule" @select="onSectionSelected" />
                        </SplitterPanel>
                        <SplitterPanel :size="50" class="flex flex-column">
                            <SecurityPermissionsTable :section="selectedSection" />
                        </SplitterPanel>
                    </Splitter>
                </SplitterPanel>
                
            </Splitter>
        </div>
    </div>
</template>