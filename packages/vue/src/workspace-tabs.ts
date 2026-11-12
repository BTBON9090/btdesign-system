import {
  Comment,
  Fragment,
  Text,
  defineComponent,
  getCurrentInstance,
  h,
  isVNode,
  mergeProps,
  nextTick,
  onBeforeUnmount,
  onMounted,
  onUpdated,
  ref,
  watch,
  type PropType,
} from 'vue';
import { safeHref } from '@btdesign/engine';

export interface WorkspaceTabItem {
  key: string;
  label: string;
  href?: string;
  disabled?: boolean;
  closable?: boolean;
}
function hasContent(content: unknown): boolean {
  if (Array.isArray(content)) return content.some(hasContent);
  if (content == null || typeof content === 'boolean') return false;
  if (!isVNode(content)) return String(content).trim().length > 0;
  if (content.type === Comment) return false;
  if (content.type === Text)
    return typeof content.children === 'string' && content.children.trim().length > 0;
  if (content.type === Fragment) return hasContent(content.children);
  return true;
}

/** A navigation strip whose selected tab and tab list are owned by the caller. */
export const WorkspaceTabs = defineComponent({
  name: 'BTDESIGNWorkspaceTabs',
  inheritAttrs: false,
  props: {
    items: { type: Array as PropType<WorkspaceTabItem[]>, required: true },
    activeKey: { type: [String, null] as unknown as PropType<string | null>, required: true },
    label: { type: String, default: '工作区标签' },
  },
  emits: { select: (_key: string) => true, close: (_key: string) => true },
  setup(props, { attrs, emit, slots }) {
    const instance = getCurrentInstance();
    const onceConsumed = ref(false);
    const hasClose = () =>
      Boolean(
        instance?.vnode.props?.onClose ||
        (!onceConsumed.value && instance?.vnode.props?.onCloseOnce),
      );
    const viewport = ref<HTMLElement>();
    const list = ref<HTMLElement>();
    const previousButton = ref<HTMLButtonElement>();
    const nextButton = ref<HTMLButtonElement>();
    const overflow = ref(false),
      atLeft = ref(true),
      atRight = ref(true);
    const mounted = ref(false);
    let observer: ResizeObserver | undefined;
    let resizeFallback = false;
    const entries = new Map<string, HTMLElement>();
    let lastActive: string | null | undefined;
    let lastActiveElement: HTMLElement | undefined;
    let pendingReveal = false;
    let activeWasVisible = false;
    let lastLayout: string | undefined;
    let userIntent = false;
    let intentFrame: number | undefined;
    let intentTimeout: ReturnType<typeof setTimeout> | undefined;
    const markUserIntent = () => {
      userIntent = true;
      if (intentFrame !== undefined && typeof cancelAnimationFrame === 'function')
        cancelAnimationFrame(intentFrame);
      if (intentTimeout !== undefined) clearTimeout(intentTimeout);
      const clearIntent = () => {
        userIntent = false;
        intentFrame = undefined;
        intentTimeout = undefined;
      };
      if (typeof requestAnimationFrame === 'function')
        intentFrame = requestAnimationFrame(clearIntent);
      else intentTimeout = setTimeout(clearIntent, 16);
    };
    const layoutSignature = () => {
      const target = viewport.value;
      if (!target) return '';
      return `${target.clientWidth}:${target.scrollWidth}:${list.value?.getBoundingClientRect().width ?? 0}`;
    };
    let pendingFocus: { element: HTMLElement; keys: string[]; index: number } | undefined;
    const measure = () => {
      const target = viewport.value;
      if (!target) return;
      const maximum = Math.max(0, target.scrollWidth - target.clientWidth);
      const rtl =
        typeof window !== 'undefined' && window.getComputedStyle(target).direction === 'rtl';
      const position = Math.min(
        maximum,
        Math.max(0, rtl ? target.scrollLeft + maximum : target.scrollLeft),
      );
      const tolerance = Math.min(1, maximum / 2);
      overflow.value = maximum > 0;
      atLeft.value = position <= tolerance;
      atRight.value = position >= maximum - tolerance;
      if (pendingReveal && target.clientWidth > 0) revealActive();
    };
    const scrollBy = (target: HTMLElement, distance: number) => {
      if (typeof target.scrollBy === 'function') {
        try {
          target.scrollBy({ left: distance, behavior: 'auto' });
        } catch {
          target.scrollLeft += distance;
        }
      } else target.scrollLeft += distance;
      measure();
    };
    const shift = (direction: -1 | 1) => {
      const target = viewport.value;
      if (target) scrollBy(target, Math.max(1, target.clientWidth * 0.8) * direction);
    };
    const visibleBounds = () => {
      const target = viewport.value;
      if (!target) return undefined;
      const rect = target.getBoundingClientRect();
      let left = rect.left;
      let right = rect.right;
      const center = (left + right) / 2;
      for (const [button, hidden] of [
        [previousButton.value, atLeft.value],
        [nextButton.value, atRight.value],
      ] as const) {
        if (!overflow.value || hidden || !button) continue;
        const buttonRect = button.getBoundingClientRect();
        if (buttonRect.right <= left || buttonRect.left >= right) continue;
        if ((buttonRect.left + buttonRect.right) / 2 <= center)
          left = Math.max(left, buttonRect.right);
        else right = Math.min(right, buttonRect.left);
      }
      return { left, right };
    };
    const updateVisibility = () => {
      const entry = props.activeKey == null ? undefined : entries.get(props.activeKey);
      const target = viewport.value;
      if (!entry || !target || target.clientWidth <= 0) return;
      const bounds = visibleBounds();
      if (!bounds) return;
      const itemRect = (entry.closest?.('.f-workspace-tabs-item') ?? entry).getBoundingClientRect();
      activeWasVisible = itemRect.left >= bounds.left - 1 && itemRect.right <= bounds.right + 1;
    };
    const revealActive = () => {
      const active = props.activeKey;
      const entry = active == null ? undefined : entries.get(active);
      if (lastActive === active && lastActiveElement === entry && !pendingReveal) return;
      lastActive = active;
      lastActiveElement = entry;
      const target = viewport.value;
      if (!entry || !target) {
        pendingReveal = false;
        return;
      }
      if (target.clientWidth <= 0) {
        pendingReveal = true;
        return;
      }
      if (overflow.value && (!previousButton.value || !nextButton.value)) {
        pendingReveal = true;
        return;
      }
      pendingReveal = false;
      if (
        typeof entry.getBoundingClientRect !== 'function' ||
        typeof target.getBoundingClientRect !== 'function'
      )
        return;
      const row = entry.closest?.('.f-workspace-tabs-item') ?? entry;
      const itemRect = row.getBoundingClientRect();
      const bounds = visibleBounds();
      if (!bounds) return;
      const { left, right } = bounds;
      const delta =
        itemRect.left < left
          ? itemRect.left - left
          : itemRect.right > right
            ? itemRect.right - right
            : 0;
      if (delta) scrollBy(target, Math.sign(delta) * Math.ceil(Math.abs(delta)));
      updateVisibility();
    };
    const handleLayout = () => {
      const signature = layoutSignature();
      const changed = lastLayout !== undefined && lastLayout !== signature;
      const shouldReveal = changed && activeWasVisible && !userIntent;
      lastLayout = signature;
      measure();
      if (shouldReveal) {
        pendingReveal = true;
        revealActive();
      } else if (changed && userIntent) updateVisibility();
    };
    const handleScroll = () => {
      if (lastLayout !== undefined && lastLayout !== layoutSignature()) {
        handleLayout();
        return;
      }
      measure();
      updateVisibility();
    };
    const restoreFocus = () => {
      if (!mounted.value || !pendingFocus || typeof document === 'undefined') return;
      const { element, keys, index } = pendingFocus;
      if (element.isConnected) {
        if (document.activeElement !== element) pendingFocus = undefined;
        return;
      }
      pendingFocus = undefined;
      if (document.activeElement !== document.body) return;
      const available = new Set(
        props.items.filter((item) => !item.disabled).map((item) => item.key),
      );
      const candidates = [
        ...keys.slice(index + 1),
        ...keys.slice(0, index).reverse(),
        ...props.items.map((item) => item.key),
      ];
      const next = candidates.find((key) => available.has(key) && entries.has(key));
      if (next) entries.get(next)?.focus();
    };
    onMounted(() => {
      mounted.value = true;
      nextTick(() => {
        handleLayout();
        revealActive();
      });
      if (typeof ResizeObserver !== 'undefined') {
        observer = new ResizeObserver(handleLayout);
        if (viewport.value) observer.observe(viewport.value);
        if (list.value) observer.observe(list.value);
      } else if (typeof window !== 'undefined') {
        window.addEventListener('resize', handleLayout);
        resizeFallback = true;
      }
    });
    onBeforeUnmount(() => {
      mounted.value = false;
      pendingFocus = undefined;
      observer?.disconnect();
      if (resizeFallback && typeof window !== 'undefined')
        window.removeEventListener('resize', handleLayout);
      if (intentFrame !== undefined && typeof cancelAnimationFrame === 'function')
        cancelAnimationFrame(intentFrame);
      if (intentTimeout !== undefined) clearTimeout(intentTimeout);
    });
    onUpdated(() => {
      revealActive();
      restoreFocus();
    });
    watch(
      () => props.items,
      () =>
        nextTick(() => {
          if (mounted.value) {
            measure();
            revealActive();
            restoreFocus();
          }
        }),
      { deep: true },
    );
    return () => {
      const more = slots.more?.();
      return h(
        'nav',
        mergeProps({ 'aria-label': props.label }, attrs, {
          class: 'f-workspace-tabs',
          onWheel: markUserIntent,
          onPointerdown: markUserIntent,
          onTouchstart: markUserIntent,
          onKeydown: markUserIntent,
          onFocusout: (event: FocusEvent) => {
            if (pendingFocus?.element === event.target) nextTick(restoreFocus);
          },
        }),
        [
          overflow.value
            ? h(
                'button',
                {
                  type: 'button',
                  ref: previousButton,
                  class:
                    'f-workspace-tabs-scroll f-workspace-tabs-scroll--previous f-button f-button--ghost',
                  disabled: atLeft.value,
                  'aria-label': '向左滚动标签',
                  onClick: () => shift(-1),
                },
                h('span', { 'aria-hidden': 'true' }, '‹'),
              )
            : null,
          h('div', { ref: viewport, class: 'f-workspace-tabs-viewport', onScroll: handleScroll }, [
            h(
              'ul',
              { ref: list, class: 'f-workspace-tabs-list' },
              props.items.map((item) => {
                const href = item.disabled ? undefined : safeHref(item.href);
                const control = h(
                  href ? 'a' : 'button',
                  {
                    class: 'f-workspace-tabs-link',
                    ref: (element: unknown) => {
                      if (element) entries.set(item.key, element as HTMLElement);
                      else entries.delete(item.key);
                    },
                    ...(href ? { href } : { type: 'button', disabled: item.disabled }),
                    'aria-current': props.activeKey === item.key ? 'page' : undefined,
                    onClick: () => {
                      if (!item.disabled) emit('select', item.key);
                    },
                  },
                  item.label,
                );
                const close =
                  item.closable && hasClose()
                    ? h(
                        'button',
                        {
                          type: 'button',
                          class: 'f-workspace-tabs-close f-button f-button--ghost',
                          disabled: item.disabled,
                          'aria-label': `关闭${item.label}`,
                          onClick: (event: MouseEvent) => {
                            if (item.disabled || !hasClose()) return;
                            const element = event.currentTarget as HTMLElement | null;
                            if (
                              element &&
                              typeof document !== 'undefined' &&
                              document.activeElement === element
                            )
                              pendingFocus = {
                                element,
                                keys: props.items.map((entry) => entry.key),
                                index: props.items.findIndex((entry) => entry.key === item.key),
                              };
                            else pendingFocus = undefined;
                            if (instance?.vnode.props?.onCloseOnce) onceConsumed.value = true;
                            emit('close', item.key);
                            nextTick(restoreFocus);
                          },
                        },
                        h('span', { 'aria-hidden': 'true' }, '×'),
                      )
                    : null;
                return h('li', { class: 'f-workspace-tabs-item', key: item.key }, [control, close]);
              }),
            ),
          ]),
          overflow.value
            ? h(
                'button',
                {
                  type: 'button',
                  ref: nextButton,
                  class:
                    'f-workspace-tabs-scroll f-workspace-tabs-scroll--next f-button f-button--ghost',
                  disabled: atRight.value,
                  'aria-label': '向右滚动标签',
                  onClick: () => shift(1),
                },
                h('span', { 'aria-hidden': 'true' }, '›'),
              )
            : null,
          hasContent(more) ? h('div', { class: 'f-workspace-tabs-more' }, more) : null,
        ],
      );
    };
  },
});
