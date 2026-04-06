export default function Text({
  as: Tag = "p",
  children,
  className = "",
}) {
  return (
    <Tag
      className={`text-[var(--color-black-shade-600)] ${className}`}
    >
      {children}
    </Tag>
  );
}
