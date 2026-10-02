import { useSearchParams } from "react-router";
import { ChangeProposals } from "../pages/ChangeProposals";

export default function ChangeProposalsRoute() {
  const [searchParams] = useSearchParams();
  return <ChangeProposals filter={searchParams.get("q")} />;
}
