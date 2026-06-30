// src/presets/KiwiKTheme.ts
import { definePreset } from '@primevue/themes';
import Aura from '@primevue/themes/aura';

const KiwiKTheme = definePreset(Aura, {
    semantic: {
        primary: {
            50: '#f9fbe7',
            100: '#f0f9c2',
            200: '#e1f486',
            300: '#c8ea4a',
            400: '#b1d70e',
            500: '#9cc10a',
            600: '#7fa608',
            700: '#648506',
            800: '#4d6605',
            900: '#384a03',
            950: '#1d2702',

            // 🔥 texto sobre colores primary (botones, chips, etc.)
            contrast: '#333333'
        },

        colorScheme: {
            light: {
                surface: {
                    0: '#ffffff',
                    50: '#f8f8f8',
                    100: '#f1f1f1',
                    200: '#e7e7e7',
                    300: '#d4d4d4',
                    400: '#bdbdbd',
                    500: '#9e9e9e',
                    600: '#777777',
                    700: '#555555',
                    800: '#333333',
                    900: '#1f1f1f'
                },

                text: {
                    color: '#2b2b2b',        // 🔥 texto general (ANTES era demasiado blanco/neutral)
                    mutedColor: '#666666',
                    disabledColor: '#9a9a9a'
                }
            }
        }
    },

    // 🔥 IMPORTANTE: controla botones explícitamente
    components: {
        button: {
            colorScheme: {
                light: {
                    primary: {
                        color: '#333333',        // texto botón primary
                        hoverColor: '#111111'
                    }
                }
            }
        },

        inputtext: {
            colorScheme: {
                light: {
                    root: {
                        color: '#2b2b2b' // texto input
                    }
                }
            }
        },

        textarea: {
            colorScheme: {
                light: {
                    root: {
                        color: '#2b2b2b'
                    }
                }
            }
        }
    }



    
});

export default KiwiKTheme;