import Image from "next/image";
import Link from "next/link";

type Props = {
  href?: string;
  className?: string;
};

export function AuthPageLogo({ href, className = "h-auto w-full max-w-[300px] object-contain" }: Props) {
  const img = (
    <Image
      src="/zbounbanner-auth.png"
      alt="Zboun"
      width={913}
      height={318}
      className={className}
      priority
      unoptimized
    />
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex outline-none transition-opacity hover:opacity-80">
        {img}
      </Link>
    );
  }

  return img;
}
