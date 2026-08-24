import { avatarColor, initialsOf } from "../../lib/utils";

interface AvatarProps {
  name: string;
  size?: number;
}

export default function Avatar({ name, size = 32 }: AvatarProps) {
  return (
    <div
      className="flex items-center justify-center rounded-full text-white font-semibold shrink-0"
      style={{
        width: size,
        height: size,
        background: avatarColor(name),
        fontSize: size * 0.4,
      }}
    >
      {initialsOf(name)}
    </div>
  );
}
