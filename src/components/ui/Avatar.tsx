interface AvatarProps {
  name: string;
  size?: number;
  hue?: number;
}

export function Avatar({ name, size = 28, hue }: AvatarProps) {
  const initials = name.split(/\s+/).map(p => p[0]).slice(0, 2).join('').toUpperCase();
  const h = hue ?? (name.charCodeAt(0) * 37) % 360;
  return (
    <div
      className="avatar"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.4,
        background: `linear-gradient(135deg, oklch(0.78 0.06 ${h}), oklch(0.55 0.10 ${h}))`,
      }}
    >
      {initials}
    </div>
  );
}
