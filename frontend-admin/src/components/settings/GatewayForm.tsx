import { useEffect, useState, type ComponentType, type CSSProperties } from "react";
import AdminShell from "@/components/layout/Adminshell";
import Field from "@/components/ui/Field";
import { settingsApi } from "@/lib/api";
import { useToast } from "@/hooks/useToast";

interface GatewayField {
  key: string;
  label: string;
  secret?: boolean;
  placeholder?: string;
}

interface GatewayFormProps {
  provider: string;
  title: string;
  description: string;
  icon: ComponentType<{ size?: number; className?: string; style?: CSSProperties }>;
  fields: GatewayField[];
}

function GatewayForm({
  provider,
  title,
  description,
  icon: Icon,
  fields,
}: GatewayFormProps) {
  const { push } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [environment, setEnvironment] = useState("sandbox");
  const [isActive, setIsActive] = useState(false);
  const [values, setValues] = useState<Record<string, string>>({});

  useEffect(() => {
    let cancelled = false;
    settingsApi
      .gateways()
      .then((list) => {
        if (cancelled) return;
        const gw = list.find((g) => g.provider === provider);
        if (gw) {
          setEnvironment(gw.environment);
          setIsActive(gw.is_active);
          setValues(gw.config);
        }
      })
      .catch((err) => push(err.message, "error"))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [provider]);

  async function save() {
    setSaving(true);
    try {
      const updated = await settingsApi.update(provider, {
        environment,
        is_active: isActive,
        config: values,
      });
      setEnvironment(updated.environment);
      setIsActive(updated.is_active);
      setValues(updated.config);
      push("Settings saved");
    } catch (err) {
      push(err instanceof Error ? err.message : "Failed to save", "error");
    } finally {
      setSaving(false);
    }
  }

  async function testConnection() {
    setTesting(true);
    try {
      const res = await settingsApi.test(provider, { environment, config: values });
      push(res.message, res.ok ? "success" : "error");
    } catch (err) {
      push(err instanceof Error ? err.message : "Failed to test connection", "error");
    } finally {
      setTesting(false);
    }
  }

  return (
    <AdminShell title={title}>
      <div className="ad-card overflow-hidden">
        <div className="px-5 py-4 flex items-center gap-3 border-b" style={{ borderColor: "var(--ad-border)" }}>
          <span className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: "var(--ad-active-bg)" }}>
            <Icon size={17} style={{ color: "#3B82F6" }} />
          </span>
          <div>
            <h2 className="font-bold leading-tight" style={{ color: "var(--ad-fg)" }}>
              {title}
            </h2>
            <span className="text-xs" style={{ color: "var(--ad-muted)" }}>
              {description}
            </span>
          </div>
        </div>

        <div className="p-5">
          {loading ? (
            <div className="py-8 text-center text-sm" style={{ color: "var(--ad-muted)" }}>
              Loading…
            </div>
          ) : (
            <div className="space-y-4">
              {fields.map((f) => (
                <Field
                  key={f.key}
                  label={f.label}
                  type={f.secret ? "password" : "text"}
                  value={values[f.key] ?? ""}
                  onChange={(v) => setValues((s) => ({ ...s, [f.key]: v }))}
                  placeholder={f.placeholder}
                />
              ))}

              <div>
                <span className="block text-sm font-medium mb-1.5" style={{ color: "var(--ad-fg)" }}>
                  Environment
                </span>
                <div className="flex items-center gap-2">
                  {(["sandbox", "production"] as const).map((env) => {
                    const selected = environment === env;
                    return (
                      <button
                        key={env}
                        type="button"
                        onClick={() => setEnvironment(env)}
                        className="px-4 py-2 rounded-md text-sm font-semibold border transition-colors"
                        style={{
                          color: selected ? "#3B82F6" : "var(--ad-muted)",
                          background: selected ? "rgba(59,130,246,0.10)" : "transparent",
                          borderColor: selected ? "#3B82F6" : "var(--ad-border)",
                        }}
                      >
                        {env}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <div>
                  <div className="text-sm font-medium" style={{ color: "var(--ad-fg)" }}>
                    Enable {title}
                  </div>
                  <div className="text-xs" style={{ color: "var(--ad-muted)" }}>
                    Disabling this keeps the provider from being used.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsActive((v) => !v)}
                  className="relative w-11 h-6 rounded-full transition-colors"
                  style={{ background: isActive ? "#3B82F6" : "var(--ad-border)" }}
                  title={isActive ? "Active" : "Inactive"}
                >
                  <span
                    className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all"
                    style={{ left: isActive ? 22 : 2 }}
                  />
                </button>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={testConnection}
                  disabled={testing}
                  className="ad-btn ad-btn-ghost flex-1 justify-center"
                >
                  {testing ? "Testing…" : "Test Connection"}
                </button>
                <button type="button" onClick={save} disabled={saving} className="ad-btn flex-1 justify-center">
                  {saving ? "Saving…" : "Save"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminShell>
  );
}

export default GatewayForm;