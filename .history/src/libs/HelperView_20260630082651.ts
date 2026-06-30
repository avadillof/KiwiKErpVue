export function useFormValidator() {

    const refs = ref<Record<string, any>>({});

    const setRef = (key: string, el: any) => {
        if (el) refs.value[key] = el;
    };

    const scrollToError = async (errorKey: string) => {
        await nextTick();

        const element = refs.value[errorKey];

        if (!element) return;

        const el = element.$el || element;

        el.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
        });

        const input = el.querySelector?.('input') || el;
        input.focus?.();
    };

    return {
        setRef,
        scrollToError
    };
}