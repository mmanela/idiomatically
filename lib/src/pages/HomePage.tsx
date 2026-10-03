import { Typography } from "antd";
import { Link } from "react-router";
import { FeaturedIdiom } from "../components/FeaturedIdiom";
import { IdiomListRenderer } from "../components/IdiomListRenderer";
import type { FeaturedIdiom as FeaturedIdiomData } from "../loaders/featuredIdiom.server";
import type { IdiomListData } from "../loaders/idioms.server";
import "./HomePage.scss";

const { Title } = Typography;
const POPULAR_IDIOM_COUNT = 6;

export function HomePage({
  idiomData,
  featuredIdiom,
}: {
  idiomData: IdiomListData;
  featuredIdiom: FeaturedIdiomData | null;
}) {
  const popularIdioms = idiomData.idioms.edges
    .map((edge) => edge.node)
    .filter((idiom) => idiom.id !== featuredIdiom?.id)
    .slice(0, POPULAR_IDIOM_COUNT);

  return (
    <section className="homePage">
      {featuredIdiom && <FeaturedIdiom idiom={featuredIdiom} />}

      <div className="popularIdiomsHeader">
        <Title level={2}>Popular idioms</Title>
        <Link to="/idioms">Browse all idioms</Link>
      </div>
      <IdiomListRenderer
        className="homeIdiomList"
        pageSize={POPULAR_IDIOM_COUNT}
        totalCount={popularIdioms.length}
        idioms={popularIdioms}
      />
    </section>
  );
}
