export default function ActiveBadge({ active }: { active: boolean }) {
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-[0.65rem] font-bold tracking-wide"
      style={
        active
          ? { color: "#059669", background: "rgba(16,185,129,0.12)" }
          : { color: "#94A3B8", background: "rgba(148,163,184,0.15)" }
      }
    >
      {active ? "ACTIVE" : "INACTIVE"}
    </span>
  );
}