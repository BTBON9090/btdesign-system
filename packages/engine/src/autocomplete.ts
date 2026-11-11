import type { ChoiceOption } from './types.js';

/** Local text suggestions; the application owns loading any external option data. */
export function filterAutocompleteOptions(
  options: readonly ChoiceOption[],
  query: string,
): ChoiceOption[] {
  const term = query.trim().toLocaleLowerCase();
  return term
    ? options.filter((option) =>
        `${option.label} ${option.value}`.toLocaleLowerCase().includes(term),
      )
    : [...options];
}

/** Move among enabled results without wrapping; -1 means no active option. */
export function moveAutocompleteFocus(
  options: readonly ChoiceOption[],
  current: number,
  direction: 1 | -1,
): number {
  if (!options.length) return -1;
  let index =
    current < 0 || current >= options.length
      ? direction === 1
        ? 0
        : options.length - 1
      : current + direction;
  while (index >= 0 && index < options.length) {
    if (!options[index].disabled) return index;
    index += direction;
  }
  return current >= 0 && current < options.length && !options[current].disabled ? current : -1;
}
