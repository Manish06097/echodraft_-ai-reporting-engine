import type { Diff } from '../types';

/**
 * Find the differences between two texts.
 * This implementation finds common prefixes and suffixes, then treats the middle as a single deletion/insertion.
 * @param {string} text1 The old text.
 * @param {string} text2 The new text.
 * @return {Array<Diff>} Array of diff tuples.
 */
export function diff(text1: string, text2: string): Diff[] {
  // If texts are identical, return a single 'common' diff.
  if (text1 === text2) {
    return text1.length > 0 ? [[0, text1]] : [];
  }

  // 1. Find common prefix length
  let commonPrefix = 0;
  const minLength = Math.min(text1.length, text2.length);
  while (commonPrefix < minLength && text1[commonPrefix] === text2[commonPrefix]) {
    commonPrefix++;
  }

  // 2. Find common suffix length
  let commonSuffix = 0;
  while (
    commonSuffix < minLength - commonPrefix &&
    text1[text1.length - 1 - commonSuffix] === text2[text2.length - 1 - commonSuffix]
  ) {
    commonSuffix++;
  }

  // 3. Extract parts
  const prefix = text1.substring(0, commonPrefix);
  const suffix = text1.substring(text1.length - commonSuffix);
  const t1 = text1.substring(commonPrefix, text1.length - commonSuffix);
  const t2 = text2.substring(commonPrefix, text2.length - commonSuffix);

  // 4. Build the diff array
  const diffs: Diff[] = [];
  if (prefix) {
    diffs.push([0, prefix]);
  }
  if (t1) {
    diffs.push([-1, t1]);
  }
  if (t2) {
    diffs.push([1, t2]);
  }
  if (suffix) {
    diffs.push([0, suffix]);
  }
  
  return merge(diffs);
}

function merge(diffs: Diff[]): Diff[] {
  if (diffs.length === 0) return [];
  const merged: Diff[] = [];
  let last = [...diffs[0]] as Diff; // Create a copy to modify

  for (let i = 1; i < diffs.length; i++) {
    const current = diffs[i];
    if (last[0] === current[0] && last[1]) {
      last[1] += current[1];
    } else {
      if (last[1]) merged.push(last);
      last = [...current] as Diff;
    }
  }
  if (last[1]) merged.push(last);
  return merged;
}

export function diffToHTML(diffs: Diff[]): string {
    let html = '';
    for(const [op, text] of diffs) {
        switch(op) {
            case 1:
                html += `<span class="bg-green-500/30 rounded px-1">${text}</span>`;
                break;
            case -1:
                html += `<span class="bg-red-500/30 line-through rounded px-1">${text}</span>`;
                break;
            case 0:
                html += text;
                break;
        }
    }
    return html;
}
