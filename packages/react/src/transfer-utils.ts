import type { ChoiceOption } from '@btdesign/engine';

/** Only move visible checked items; hidden checks remain pending until the filter changes. */
export function visibleTransferSelection(
  options: readonly ChoiceOption[],
  checked: readonly string[],
  query: string,
): string[] {
  const needle = query.toLocaleLowerCase();
  return options
    .filter((option) => !option.disabled && checked.includes(option.value))
    .filter((option) => option.label.toLocaleLowerCase().includes(needle))
    .map((option) => option.value);
}
