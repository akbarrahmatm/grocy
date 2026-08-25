import { CreditCard } from "lucide-react";
import GatewayForm from "@/components/settings/GatewayForm";

function PaymentGateway() {
  return (
    <GatewayForm
      provider="midtrans"
      title="Payment Gateway"
      description="Midtrans Snap"
      icon={CreditCard}
      fields={[
        {
          key: "server_key",
          label: "Server Key",
          secret: true,
          placeholder: "SB-Mid-server-…",
        },
        {
          key: "client_key",
          label: "Client Key",
          placeholder: "SB-Mid-client-…",
        },
      ]}
    />
  );
}

export default PaymentGateway;
