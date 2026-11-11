/** File metadata supplied by the caller. Neither MIME nor the filename proves the contents. */
export interface FileCandidate {
  name: string;
  size: number;
  type: string;
}
export interface FileValidationOptions {
  /** A comma-separated HTML file-accept list of extensions, MIME types and audio/image/video wildcards. */
  accept?: string;
  /** Whether more than one valid file may be accepted in this operation. Defaults to false. */
  multiple?: boolean;
  /** Maximum size per file in bytes, inclusive. Omit for no size limit. */
  maxFileSize?: number;
  /** Maximum total count including existingCount. Omit for no total-count limit. */
  maxFiles?: number;
  /** Number of files already owned by the application; no queue is maintained here. */
  existingCount?: number;
}
export type FileRejectionCode =
  | 'type-not-accepted'
  | 'type-unverifiable'
  | 'file-too-large'
  | 'too-many-files'
  | 'multiple-not-allowed';
export interface FileRejection<T extends FileCandidate> {
  file: T;
  /** Position in the original input, including duplicate references. */
  index: number;
  /** Type and size failures are reported together; a failed file never consumes a count slot. */
  reasons: FileRejectionCode[];
}
export interface FileValidationResult<T extends FileCandidate> {
  accepted: T[];
  rejected: FileRejection<T>[];
}
type AcceptRule = { kind: 'extension' | 'mime' | 'wildcard'; value: string };
const mimePattern = /^[a-z0-9!#$%&'*+.^_`|~-]+\/[a-z0-9!#$%&'*+.^_`|~-]+$/i;
const extensionPattern = /^\.[^\s,./\\]+(?:\.[^\s,./\\]+)*$/;
function parseAccept(accept: string | undefined): AcceptRule[] {
  if (accept === undefined || !accept.trim()) return [];
  const rules: AcceptRule[] = [];
  for (const item of accept.split(',')) {
    const value = item.trim().toLowerCase();
    if (!value) continue;
    if (extensionPattern.test(value)) rules.push({ kind: 'extension', value });
    else if (/^(image|audio|video)\/\*$/.test(value))
      rules.push({ kind: 'wildcard', value: value.slice(0, -1) });
    else if (mimePattern.test(value) && !value.includes('*')) rules.push({ kind: 'mime', value });
    else throw new TypeError(`Invalid accept specifier: ${value}`);
  }
  if (!rules.length) throw new TypeError('An accept list must contain a valid file type');
  return rules;
}
function countOption(name: string, value: number | undefined): void {
  if (value !== undefined && (!Number.isSafeInteger(value) || value < 0))
    throw new RangeError(`${name} must be a non-negative safe integer`);
}
function typeResult(file: FileCandidate, rules: AcceptRule[]): 'accepted' | 'rejected' | 'unknown' {
  if (!rules.length) return 'accepted';
  const name = file.name.toLowerCase();
  const mime = file.type.trim().toLowerCase();
  const hasMime = mimePattern.test(mime) && !mime.includes('*');
  if (rules.some((rule) => rule.kind === 'extension' && name.endsWith(rule.value)))
    return 'accepted';
  if (
    hasMime &&
    rules.some((rule) =>
      rule.kind === 'mime'
        ? mime === rule.value
        : rule.kind === 'wildcard' && mime.startsWith(rule.value),
    )
  )
    return 'accepted';
  // A MIME rule can still match a file whose browser supplied no usable MIME type.
  if (!hasMime && rules.some((rule) => rule.kind !== 'extension')) return 'unknown';
  return 'rejected';
}
/**
 * Synchronous metadata screening only. It does not inspect bytes, mutate File objects,
 * deduplicate, upload, manage a queue, or replace server-side validation.
 * Invalid options and invalid candidate metadata throw rather than silently weakening rules.
 */
export function validateFiles<T extends FileCandidate>(
  files: readonly T[],
  options: FileValidationOptions = {},
): FileValidationResult<T> {
  if (typeof options.accept !== 'undefined' && typeof options.accept !== 'string')
    throw new TypeError('accept must be a string');
  if (typeof options.multiple !== 'undefined' && typeof options.multiple !== 'boolean')
    throw new TypeError('multiple must be a boolean');
  countOption('maxFileSize', options.maxFileSize);
  countOption('maxFiles', options.maxFiles);
  countOption('existingCount', options.existingCount);
  const rules = parseAccept(options.accept);
  const accepted: T[] = [];
  const rejected: FileRejection<T>[] = [];
  const remaining =
    options.maxFiles === undefined
      ? Infinity
      : Math.max(0, options.maxFiles - (options.existingCount ?? 0));
  files.forEach((file, index) => {
    if (
      !file ||
      typeof file.name !== 'string' ||
      typeof file.type !== 'string' ||
      !Number.isSafeInteger(file.size) ||
      file.size < 0
    )
      throw new TypeError(`Invalid file metadata at index ${index}`);
    const reasons: FileRejectionCode[] = [];
    const type = typeResult(file, rules);
    if (type === 'rejected') reasons.push('type-not-accepted');
    if (type === 'unknown') reasons.push('type-unverifiable');
    if (options.maxFileSize !== undefined && file.size > options.maxFileSize)
      reasons.push('file-too-large');
    if (!reasons.length) {
      if (!options.multiple && accepted.length >= 1) reasons.push('multiple-not-allowed');
      else if (accepted.length >= remaining) reasons.push('too-many-files');
    }
    if (reasons.length) rejected.push({ file, index, reasons });
    else accepted.push(file);
  });
  return { accepted, rejected };
}
