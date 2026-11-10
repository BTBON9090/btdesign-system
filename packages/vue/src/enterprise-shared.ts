import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import type { Ref } from 'vue';
export function useValue<T>(read: () => T | undefined, initial: T, emit: (value: T) => void) {
  const local = ref(initial) as Ref<T>;
  const value = computed(() => (read() === undefined ? local.value : (read() as T)));
  const set = (next: T) => {
    if (read() === undefined) local.value = next;
    emit(next);
  };
  return { value, set };
}
export function useDismiss(
  root: Ref<HTMLElement | undefined>,
  open: Ref<boolean>,
  close: () => void,
) {
  const outside = (event: PointerEvent) => {
    if (open.value && root.value && !root.value.contains(event.target as Node)) close();
  };
  onMounted(() => {
    if (typeof document !== 'undefined') document.addEventListener('pointerdown', outside);
  });
  onBeforeUnmount(() => {
    if (typeof document !== 'undefined') document.removeEventListener('pointerdown', outside);
  });
}
export const asArray = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value : value ? [value] : [];
export const isDisabled = (value: unknown) => value === true || value === '';

export function useModel<T>(read: () => T | undefined, initial: T, emit: (value: T) => void) {
  const state = useValue(read, initial, emit);
  return computed({ get: () => state.value.value, set: state.set });
}
