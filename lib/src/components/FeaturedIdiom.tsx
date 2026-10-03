import { Typography } from "antd";
import { Link } from "react-router";
import type { FeaturedIdiom as FeaturedIdiomData } from "../loaders/featuredIdiom.server";
import { LanguageFlags } from "./LanguageFlags";
import {
  MarkdownContent,
  markdownBeforeFirstHeading,
} from "./MarkdownContent";
import "./FeaturedIdiom.scss";

const { Paragraph, Text, Title } = Typography;

export function FeaturedIdiom({ idiom }: { idiom: FeaturedIdiomData }) {
  const equivalentCount = idiom.equivalentCount;
  const descriptionPreview = idiom.description
    ? markdownBeforeFirstHeading(idiom.description)
    : "";
  return (
    <aside className="featuredIdiom" aria-labelledby="featured-idiom-title">
      <Text className="featuredIdiomLabel">Featured idiom</Text>
      <div className="featuredIdiomHeader">
        <div>
          <Title id="featured-idiom-title" level={2}>
            <Link
              to={`/idioms/${idiom.slug}`}
              lang={idiom.language.languageKey}
              dir="auto"
            >
              {idiom.title}
            </Link>
          </Title>
          <LanguageFlags
            languageInfo={idiom.language}
            showLabel
            size="small"
            layoutMode="horizontal"
            compactMode
          />
        </div>
        <Text className="featuredIdiomEquivalentCount">
          {equivalentCount}{" "}
          {equivalentCount === 1 ? "equivalent idiom" : "equivalent idioms"}
        </Text>
      </div>
      {idiom.literalTranslation && (
        <Paragraph>
          <Text strong>Literally:</Text> {idiom.literalTranslation}
        </Paragraph>
      )}
      {descriptionPreview && (
        <MarkdownContent
          className="featuredIdiomDescription markdown"
          source={descriptionPreview}
        />
      )}
      <Link className="featuredIdiomLink" to={`/idioms/${idiom.slug}`}>
        Explore this idiom
      </Link>
    </aside>
  );
}
