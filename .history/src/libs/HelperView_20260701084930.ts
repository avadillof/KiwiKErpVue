import { nextTick } from 'vue';
import { ref } from 'vue';





export function useFormValidator() {

    const refs = ref<Record<string, any>>({});

    const setRef = (key: string, el: any) => {
        if (el) refs.value[key] = el;
    };

    const scrollToError = async (
    errorKey: string,
    beforeScroll?: () => Promise<void> | void
) => {

    if (beforeScroll) {
        await beforeScroll();
    }

    await nextTick();

    const element = refs.value[errorKey];

    if (!element) return;

    const el = element.$el || element;

    el.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
    });

    const input =
        el.querySelector?.('input, textarea, select') || el;

    input.focus?.();
}

    return {
        setRef,
        scrollToError
    };
}