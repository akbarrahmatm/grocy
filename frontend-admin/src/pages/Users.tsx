import { AtSign, Lock, User as UserIcon, Users as UsersIcon } from "lucide-react";
import ResourcePage, {
  type ResourceField,
} from "@/components/ui/ResourcePage";
import { userApi } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import type { AuthUser } from "@/types";

interface UsersProps {
  role?: "ADMIN" | "CUSTOMER";
}

function roleOf(user: AuthUser): "ADMIN" | "CUSTOMER" {
  return user.is_customer ? "CUSTOMER" : "ADMIN";
}

function roleBadge(user: AuthUser) {
  const admin = roleOf(user) === "ADMIN";
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-[0.65rem] font-bold tracking-wide"
      style={
        admin
          ? { color: "#3B82F6", background: "rgba(59,130,246,0.12)" }
          : { color: "#059669", background: "rgba(16,185,129,0.12)" }
      }
    >
      {roleOf(user)}
    </span>
  );
}

function Users({ role }: UsersProps) {
  const fields: ResourceField[] = [
    { name: "name", label: "Name", icon: UserIcon, placeholder: "Full name" },
    {
      name: "email",
      label: "Email",
      type: "email",
      icon: AtSign,
      placeholder: "user@example.com",
    },
    {
      name: "password",
      label: "Password",
      type: "password",
      icon: Lock,
      placeholder: "At least 8 characters",
    },
    ...(role
      ? []
      : [
          {
            name: "is_customer",
            label: "Role",
            type: "switch" as const,
            icon: UserIcon,
            initial: "false",
            options: [
              { value: "false", label: "Admin" },
              { value: "true", label: "Customer" },
            ],
          },
        ]),
  ];

  return (
    <ResourcePage<AuthUser>
      title={role === "ADMIN" ? "Admins" : role === "CUSTOMER" ? "Customers" : "Users"}
      singular="User"
      icon={UsersIcon}
      searchPlaceholder="Search by name, email, role…"
      headers={["User", "Role", "Joined"]}
      fields={fields}
      list={(opts) =>
        userApi.list({
          ...opts,
          role: role?.toLowerCase() as "admin" | "customer" | undefined,
        })
      }
      create={(payload) =>
        userApi.create({
          name: String(payload.name ?? ""),
          email: String(payload.email ?? ""),
          password: String(payload.password ?? ""),
          is_customer:
            payload.is_customer !== undefined
              ? Boolean(payload.is_customer)
              : role === "CUSTOMER",
        })
      }
      emptyText="No users."
      renderRow={(u) => [
        <div className="min-w-0">
          <div className="font-semibold truncate" style={{ color: "var(--ad-fg)" }}>
            {u.name}
          </div>
          <div className="text-xs truncate" style={{ color: "var(--ad-muted)" }}>
            {u.email}
          </div>
        </div>,
        roleBadge(u),
        <div className="text-xs" style={{ color: "var(--ad-muted)" }}>
          {formatDate(u.created_at)}
        </div>,
      ]}
    />
  );
}

export default Users;