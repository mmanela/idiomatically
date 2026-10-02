import { useSearchParams } from "react-router";
import { NewIdiom } from "../pages/NewIdiom";

export default function NewIdiomRoute() {
  const [searchParams] = useSearchParams();
  return (
    <NewIdiom
      equivalentIdiomId={searchParams.get("equivalentIdiomId") || undefined}
    />
  );
}
