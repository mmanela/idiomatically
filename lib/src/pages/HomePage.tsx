import { Empty } from "antd";
import { FeaturedIdiom } from "../components/FeaturedIdiom";
import { IdiomListRenderer } from "../components/IdiomListRenderer";
import type { FeaturedIdiom as FeaturedIdiomData } from "../loaders/featuredIdiom.server";
import type { IdiomListData } from "../loaders/idioms.server";

const POPULAR_IDIOM_COUNT = 6;

export function HomePage({
  idiomData,
  featuredIdiom,
  page,
  onPageChange,
}: {
  idiomData: IdiomListData;
  featuredIdiom: FeaturedIdiomData | null;
  page: number;
  onPageChange: (page: number) => void;
}) {
  const popularIdioms = idiomData.idioms.edges.map((edge) => edge.node);
  if (popularIdioms.length === 0) {
    return (
      <section className="homePage">
        <Empty
          image={Empty.PRESENTED_IMAGE_DEFAULT}
          description="Could not find a needle in a haystack."
        />
      </section>
    );
  }

  return (
    <section className="homePage">
      {featuredIdiom && <FeaturedIdiom idiom={featuredIdiom} />}

      <IdiomListRenderer
        className="homeIdiomList"
        pageSize={POPULAR_IDIOM_COUNT}
        totalCount={idiomData.idioms.totalCount}
        idioms={popularIdioms}
        pageNumber={page}
        onPageChange={onPageChange}
      />
    </section>
  );
}

export { POPULAR_IDIOM_COUNT };
