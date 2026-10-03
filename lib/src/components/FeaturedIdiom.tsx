import { Typography } from "antd";
import { Link } from "react-router";
import type { FeaturedIdiom as FeaturedIdiomData } from "../loaders/featuredIdiom.server";
import { LanguageFlags } from "./LanguageFlags";
import {
  MarkdownContent,
  markdownBeforeFirstHeading,
} from "./MarkdownContent";
import { getLanguagePath } from "../utilities/languagePath";
import { requiresTransliteration } from "../utilities/script";
import "./FeaturedIdiom.scss";

const { Paragraph, Text, Title } = Typography;

export function FeaturedIdiom({ idiom }: { idiom: FeaturedIdiomData }) {
  const equivalent = idiom.featuredEquivalent;
  const descriptionPreview = idiom.description
    ? markdownBeforeFirstHeading(idiom.description)
    : "";
  const equivalentDescriptionPreview = equivalent.description
    ? markdownBeforeFirstHeading(equivalent.description)
    : "";
  return (
    <aside className="featuredIdiom" aria-label="Featured translation">
      <Text className="featuredIdiomLabel">Featured translation</Text>
      <div className="featuredIdiomComparison">
        <section className="featuredIdiomEntry featuredIdiomSource">
          <LanguageFlags
            languageInfo={idiom.language}
            showLabel
            size="small"
            layoutMode="horizontal"
            compactMode
            labelHref={getLanguagePath(idiom.language.languageName)}
          />
          <Title level={3}>
            <Link
              to={`/idioms/${idiom.slug}`}
              lang={idiom.language.languageKey}
              dir="auto"
            >
              {idiom.title}
            </Link>
          </Title>
          {requiresTransliteration(idiom.title) && (
            <Paragraph>
              <Text strong>Transliteration:</Text> {idiom.transliteration}
            </Paragraph>
          )}
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
        </section>
        <span className="featuredIdiomConnector" aria-hidden="true" />
        <section className="featuredIdiomEntry featuredIdiomTarget">
          <LanguageFlags
            languageInfo={equivalent.language}
            showLabel
            size="small"
            layoutMode="horizontal"
            compactMode
            labelHref={getLanguagePath(equivalent.language.languageName)}
          />
          <Title level={3}>
            <Link
              to={`/idioms/${equivalent.slug}`}
              lang={equivalent.language.languageKey}
              dir="auto"
            >
              {equivalent.title}
            </Link>
          </Title>
          {requiresTransliteration(equivalent.title) && (
            <Paragraph>
              <Text strong>Transliteration:</Text>{" "}
              {equivalent.transliteration}
            </Paragraph>
          )}
          {equivalent.literalTranslation && (
            <Paragraph>
              <Text strong>Literally:</Text> {equivalent.literalTranslation}
            </Paragraph>
          )}
          {equivalentDescriptionPreview && (
            <MarkdownContent
              className="featuredIdiomDescription markdown"
              source={equivalentDescriptionPreview}
            />
          )}
        </section>
      </div>
    </aside>
  );
}
