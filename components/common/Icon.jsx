import Image from "next/image";

export default function Icon({
  name, // path relative to /public
  width = 20,
  height = 20,
  className = "",
  alt = "icon",
}) {
  const encodedSrc = "/" + name
    .split("/")
    .map(encodeURIComponent)
    .join("/");
    

  return (
    <Image
      src={encodedSrc}
      alt={alt}
      width={width}
      height={height}
      className={`${className}`}
    />
  );
}
