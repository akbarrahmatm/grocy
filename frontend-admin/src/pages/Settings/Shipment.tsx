import { Truck } from "lucide-react";
import GatewayForm from "@/components/settings/GatewayForm";

function Shipment() {
  return (
    <GatewayForm
      provider="komship"
      title="Shipment"
      description="Komship (Komerce)"
      icon={Truck}
      fields={[
        {
          key: "api_key",
          label: "API Key",
          secret: true,
          placeholder: "x-api-key",
        },
        {
          key: "brand_name",
          label: "Brand Name",
          placeholder: "Grocy",
        },
        {
          key: "shipper_name",
          label: "Shipper Name",
          placeholder: "Store name",
        },
        {
          key: "shipper_phone",
          label: "Shipper Phone",
          placeholder: "08xx xxxx xxxx",
        },
        {
          key: "origin_destination_id",
          label: "Origin Destination ID",
          placeholder: "68423 (from Komship destination search)",
        },
        {
          key: "origin_address",
          label: "Origin Address",
          placeholder: "Warehouse street address",
        },
        {
          key: "origin_latitude",
          label: "Origin Latitude",
          placeholder: "-6.291974",
        },
        {
          key: "origin_longitude",
          label: "Origin Longitude",
          placeholder: "106.801207",
        },
      ]}
    />
  );
}

export default Shipment;
