import { Typography } from "antd";
import "./Partners.scss";

const { Paragraph, Text, Title } = Typography;

export function Partners() {
  return (
    <article className="partnersPage">
      <Title level={1}>Idiom partners</Title>
      <Paragraph>
        These independent projects complement Idiomatically with additional
        ways to research, understand, and use idioms.
      </Paragraph>

      <section className="partnerCard">
        <Title level={2}>Idiomator</Title>
        <Paragraph>
          Idiomator combines a multilingual idiom dictionary with research
          data and practical extraction tools. Its dictionary includes
          meanings, usage examples, register, and regional information, while
          its extractor can identify idioms in pasted text or uploaded PDF
          documents.
        </Paragraph>
        <Paragraph>
          <Text strong>Best for:</Text> browsing detailed idiom references,
          exploring the MultiIdiomDataset, and detecting idioms in existing
          text.
        </Paragraph>
        <a
          href="https://idiomator.com/"
          target="_blank"
          rel="noopener noreferrer external"
        >
          Visit Idiomator
        </a>
      </section>

      <section className="partnerCard">
        <Title level={2}>Idiomatic</Title>
        <Paragraph>
          Idiomatic is an open-source, local-first Chrome extension that
          recognizes rough, literal, or cross-language idioms while you write
          and suggests culturally natural alternatives. Its backend checks a
          multilingual dictionary first and can optionally use local AI and
          web evidence when a phrase is not already known.
        </Paragraph>
        <Paragraph>
          <Text strong>Best for:</Text> finding context-aware idiom
          alternatives while writing in English, Spanish, or French.
        </Paragraph>
        <a
          href="https://github.com/MachhDev/Idiomatic"
          target="_blank"
          rel="noopener noreferrer external"
        >
          Explore Idiomatic on GitHub
        </a>
      </section>
    </article>
  );
}
