import { useCallback, useRef, useState, type SetStateAction } from 'react';
import { type ProjectSpec } from '@btdesign/core';
import { patchHistory, recordChange, redoChange, undoChange, type Timeline } from './model';

type InitialHistory = { project: ProjectSpec; past: ProjectSpec[]; future: ProjectSpec[] };

/** Live changes render immediately; one pointer/keyboard gesture occupies one undo step. */
export function useProjectHistory(initial: InitialHistory) {
  const [timeline, renderTimeline] = useState<Timeline>(() => ({
    past: initial.past,
    present: initial.project,
    future: initial.future,
  }));
  // Event handlers may run several times before React renders. Merge against the latest
  // value synchronously, rather than a render closure or a deferred updater side effect.
  const current = useRef(timeline);
  const gestureBase = useRef<Timeline | undefined>(undefined);

  const update = useCallback((action: SetStateAction<Timeline>) => {
    const next = typeof action === 'function' ? action(current.current) : action;
    current.current = next;
    renderTimeline(next);
  }, []);
  const endChange = useCallback(() => {
    gestureBase.current = undefined;
  }, []);
  const beginChange = useCallback(() => {
    gestureBase.current ??= current.current;
  }, []);
  const setTimeline = useCallback(
    (action: SetStateAction<Timeline>) => {
      endChange();
      update(action);
    },
    [endChange, update],
  );
  const commit = useCallback(
    (next: ProjectSpec) => {
      endChange();
      update((state) => recordChange(state, next));
    },
    [endChange, update],
  );
  const patch = useCallback(
    (value: unknown) => {
      update((state) => patchHistory(state, value, gestureBase.current));
    },
    [update],
  );
  const undo = useCallback(() => {
    endChange();
    update(undoChange);
  }, [endChange, update]);
  const redo = useCallback(() => {
    endChange();
    update(redoChange);
  }, [endChange, update]);

  return { timeline, setTimeline, commit, patch, beginChange, endChange, undo, redo };
}
