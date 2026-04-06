export default function Heading({
  as: Tag = "h1",
  children,
  className = "",
}) {
  return (
    <Tag
      className={`font-semibold text-black ${className}`}
    >
      {children}
    </Tag>
  );
}
