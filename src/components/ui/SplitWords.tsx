import type { ElementType } from 'react';

interface Props {
  text: string;
  as?: ElementType;
  id?: string;
  className?: string;
  /** Words (case-insensitive, punctuation ignored) that get the CLN Red accent class. */
  accent?: string[];
}

/**
 * Renders text as individually addressable words for scroll typography.
 * The full sentence stays in one aria-label so screen readers read it naturally,
 * and with animation off it is plain, fully visible text.
 */
export default function SplitWords({ text, as: Tag = 'span', id, className, accent = [] }: Props) {
  const accents = accent.map((w) => w.toLowerCase());
  return (
    <Tag id={id} className={className} aria-label={text}>
      {text.split(' ').map((word, i) => {
        const hot = accents.includes(word.toLowerCase().replace(/[^\p{L}\p{N}]/gu, ''));
        return (
          <span key={i} aria-hidden="true" className={`cln-word ${hot ? 'text-cln-red' : ''}`} data-word>
            {word}
            {'\u00A0'}
          </span>
        );
      })}
    </Tag>
  );
}
