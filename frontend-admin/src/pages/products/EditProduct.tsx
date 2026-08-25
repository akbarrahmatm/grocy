import { useParams } from "react-router-dom";
import ProductForm from "@/pages/products/ProductForm";

export default function EditProduct() {
  const { id } = useParams();
  return <ProductForm id={Number(id)} />;
}
