import { useParams } from "react-router-dom";
import AddressForm from "@/pages/AddressForm";

export default function EditAddress() {
  const { id } = useParams();
  return <AddressForm id={Number(id)} />;
}
