const chipClass =
  "inline-flex items-center max-w-[110px] rounded px-2.5 py-1 text-13 font-medium text-(--color-primary) bg-(--color-primary-shade-100) hover:opacity-80 transition-opacity cursor-pointer";

/** Shows a truncated filename chip that links to the S3 resume when href is provided */
export default function ResumeChip({ filename, href }) {
  if (!filename) {
    return <span className="text-14 text-(--color-black-shade-300)">—</span>;
  }

  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={chipClass}
        title={filename}
      >
        <span className="truncate">{filename}</span>
      </a>
    );
  }

  return (
    <span className={chipClass} title={filename}>
      <span className="truncate">{filename}</span>
    </span>
  );
}
