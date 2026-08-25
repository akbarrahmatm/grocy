import { Truck } from "lucide-react";
import GatewayForm from "@/components/settings/GatewayForm";

function Shipment() {
  return (
    <GatewayForm
      provider="biteship"
      title="Shipment"
      description="Biteship"
      icon={Truck}
      fields={[
        {
          key: "api_key",
          label: "API Key",
          secret: true,
          placeholder: "SK-biteship-…",
        },
      ]}
    />
  );
}

export default Shipment;
