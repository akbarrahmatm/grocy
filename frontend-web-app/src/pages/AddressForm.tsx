import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Crosshair, MapPin, X } from "lucide-react";
import "@/App.css";
import BottomNav from "@/components/BottomNav";
import Button from "@/components/ui/Button";
import Field from "@/components/ui/Field";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/hooks/useToast";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { addressApi, shippingApi } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { Destination } from "@/types";

const EMPTY_FORM = {
  label: "",
  receiver_name: "",
  phone: "",
  address: "",
  city: "",
  province: "",
  postal_code: "",
  destination_id: null as number | null,
  latitude: "",
  longitude: "",
  is_default: false,
};

interface AddressFormProps {
  id?: number;
}

export default function AddressForm({ id }: AddressFormProps) {
  const navigate = useNavigate();
  const { push } = useToast();
  const { count } = useCart();
  const isEdit = typeof id === "number";

  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [locating, setLocating] = useState(false);

  const [areaQuery, setAreaQuery] = useState("");
  const [areaResults, setAreaResults] = useState<Destination[]>([]);
  const [searchedFor, setSearchedFor] = useState("");
  const [showAreaList, setShowAreaList] = useState(false);
  const debouncedAreaQuery = useDebouncedValue(areaQuery, 300);
  const areaKeyword = debouncedAreaQuery.trim();
  const areaSearching =
    areaKeyword.length >= 3 && searchedFor !== areaKeyword;

  useEffect(() => {
    if (!isEdit || typeof id !== "number") return;
    let cancelled = false;
    addressApi
      .list()
      .then((res) => {
        if (cancelled) return;
        const found = res.find((a) => a.id === id);
        if (!found) {
          push("Address not found", "error");
          navigate("/address", { replace: true });
          return;
        }
        setForm({
          label: found.label,
          receiver_name: found.receiver_name,
          phone: found.phone,
          address: found.address,
          city: found.city,
          province: found.province,
          postal_code: found.postal_code,
          destination_id: found.destination_id ?? null,
          latitude: found.latitude ?? "",
          longitude: found.longitude ?? "",
          is_default: found.is_default,
        });
      })
      .catch((err) => {
        if (!cancelled) {
          push(err instanceof Error ? err.message : "Failed to load address", "error");
          navigate("/address", { replace: true });
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id, isEdit, navigate, push]);

  useEffect(() => {
    const keyword = debouncedAreaQuery.trim();
    if (keyword.length < 3) return;
    let cancelled = false;
    shippingApi
      .destinations(keyword)
      .then((res) => {
        if (cancelled) return;
        setAreaResults(res.data);
        setSearchedFor(keyword);
        setShowAreaList(true);
      })
      .catch((err) => {
        if (!cancelled)
          push(
            err instanceof Error ? err.message : "Failed to search areas",
            "error"
          );
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedAreaQuery]);

  const setField = (
    key: keyof typeof EMPTY_FORM,
    value: string | number | boolean | null
  ) => setForm((s) => ({ ...s, [key]: value }));

  function pickLocation() {
    if (!navigator.geolocation) {
      push("Geolocation is not supported by this browser", "error");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setField("latitude", pos.coords.latitude.toFixed(6));
        setField("longitude", pos.coords.longitude.toFixed(6));
        setLocating(false);
        push("Location captured");
      },
      (err) => {
        setLocating(false);
        push(
          err.code === err.PERMISSION_DENIED
            ? "Location permission denied"
            : "Failed to get current location",
          "error"
        );
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  function pickArea(area: Destination) {
    setForm((s) => ({
      ...s,
      destination_id: area.id,
      city: area.city || s.city,
      province: area.province || s.province,
      postal_code: area.postal_code || s.postal_code,
    }));
    setAreaQuery(area.label);
    setShowAreaList(false);
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    for (const key of ["label", "receiver_name", "phone", "address", "city", "province", "postal_code"] as const) {
      if (!form[key].trim()) {
        push("All fields are required except default flag", "error");
        return;
      }
    }
    if (!form.destination_id) {
      push("Pick a delivery area so we can calculate shipping", "error");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        latitude: form.latitude.trim() || null,
        longitude: form.longitude.trim() || null,
      };
      if (isEdit && typeof id === "number") {
        await addressApi.update(id, payload);
        push("Address updated");
      } else {
        await addressApi.create(payload);
        push("Address added");
      }
      navigate("/address");
    } catch (err) {
      push(err instanceof Error ? err.message : "Failed to save address", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="phone">
      <div className="section-label" style={{ paddingTop: 24 }}>
        <h2>{isEdit ? "Edit address" : "New address"}</h2>
      </div>

      {loading ? (
        <p className="text-sm text-[var(--ink-soft)] px-5 py-10 text-center">
          Loading…
        </p>
      ) : (
        <form onSubmit={handleSave} className="address-form" noValidate>
          <Field
            label="Label"
            value={form.label}
            onChange={(v) => setField("label", v)}
            placeholder="Home, Office, …"
          />
          <div className="address-form-grid">
            <Field
              label="Receiver name"
              value={form.receiver_name}
              onChange={(v) => setField("receiver_name", v)}
              placeholder="Full name"
            />
            <Field
              label="Phone"
              value={form.phone}
              onChange={(v) => setField("phone", v)}
              placeholder="08xx xxxx xxxx"
            />
          </div>
          <Field
            label="Street address"
            value={form.address}
            onChange={(v) => setField("address", v)}
            placeholder="Jl. …"
          />
          <div className="relative">
            <label className="block text-sm font-medium mb-1.5 text-[var(--ink)]">
              Delivery area
            </label>
            <div className="flex items-center gap-2">
              <input
                value={areaQuery}
                onChange={(e) => setAreaQuery(e.target.value)}
                onFocus={() =>
                  areaResults.length > 0 && setShowAreaList(true)
                }
                placeholder={
                  form.destination_id
                    ? `Selected (ID ${form.destination_id})`
                    : "Search district / city, min. 3 letters"
                }
                className={cn(
                  "w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none transition-colors bg-[var(--paper)]",
                  form.destination_id
                    ? "border-[var(--moss)]"
                    : "border-[var(--line)] focus:border-[var(--moss)]"
                )}
              />
              {areaSearching && (
                <span className="text-xs text-[var(--ink-soft)] whitespace-nowrap">
                  …
                </span>
              )}
              {form.destination_id && (
                <button
                  type="button"
                  aria-label="Clear delivery area"
                  onClick={() => {
                    setField("destination_id", null);
                    setAreaQuery("");
                  }}
                  className="text-[var(--ink-soft)] hover:text-[var(--ink)]"
                >
                  <X size={16} />
                </button>
              )}
            </div>
            {showAreaList &&
            areaResults.length > 0 &&
            areaQuery.trim().length >= 3 && (
              <ul className="absolute z-10 left-0 right-0 mt-1 rounded-xl border border-[var(--line)] bg-[var(--paper)] shadow-lg overflow-hidden max-h-56 overflow-y-auto">
                {areaResults.map((area) => (
                  <li key={area.id}>
                    <button
                      type="button"
                      onClick={() => pickArea(area)}
                      className="w-full text-left px-3.5 py-2.5 text-sm text-[var(--ink)] hover:bg-[var(--lavender)] flex items-start gap-2"
                    >
                      <MapPin size={14} className="mt-0.5 shrink-0 text-[var(--ink-soft)]" />
                      <span>{area.label}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {!form.destination_id && (
              <p className="mt-1 text-xs text-[var(--ink-soft)]">
                Required for shipping cost calculation.
              </p>
            )}
          </div>
          <div className="address-form-grid">
            <Field
              label="City"
              value={form.city}
              onChange={(v) => setField("city", v)}
              placeholder="City"
            />
            <Field
              label="Province"
              value={form.province}
              onChange={(v) => setField("province", v)}
              placeholder="Province"
            />
          </div>
          <Field
            label="Postal code"
            value={form.postal_code}
            onChange={(v) => setField("postal_code", v)}
            placeholder="12345"
          />
          <div>
            <div className="address-form-grid">
              <Field
                label="Latitude"
                value={form.latitude}
                onChange={(v) => setField("latitude", v)}
                placeholder="-6.200000"
              />
              <Field
                label="Longitude"
                value={form.longitude}
                onChange={(v) => setField("longitude", v)}
                placeholder="106.816666"
              />
            </div>
            <Button
              variant="ghost"
              type="button"
              onClick={pickLocation}
              disabled={locating}
              className="w-full mt-2 justify-center"
            >
              <Crosshair size={15} />
              {locating
                ? "Locating…"
                : form.latitude && form.longitude
                  ? "Update current location"
                  : "Use my current location"}
            </Button>
          </div>
          <label className="check-row">
            <input
              type="checkbox"
              checked={form.is_default}
              onChange={(e) => setField("is_default", e.target.checked)}
            />
            Set as default address
          </label>
          <div className="flex gap-2 pt-1">
            <Button
              variant="ghost"
              type="button"
              onClick={() => navigate("/address")}
              className="flex-1 justify-center"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving} className="flex-1 justify-center">
              {saving ? "Saving…" : isEdit ? "Save changes" : "Add address"}
            </Button>
          </div>
        </form>
      )}

      <BottomNav active="profile" cartCount={count} />
    </div>
  );
}
