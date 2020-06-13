import * as React from "react";
import { Typography } from "antd";
import "./About.scss";
const { Title, Paragraph, Text } = Typography;

export const About: React.StatelessComponent = props => {
  return (
    <article>
      <Title level={3}>About Idiomatically</Title>
      <Paragraph>
        Idiomatically is a site all about ...{" "}
        <a href="https://www.wordnik.com/words/idiom" target="_blank" rel="noopener noreferrer">
          idioms
        </a>
        .
      </Paragraph>
      <Paragraph>
        Idioms are those expressions that just don't make sense if you take them literally; but they are what make language
        interesting and colorful. They are much more than the sum of their parts - they are the linguistic equivalent of a{" "}
        <Text underline>picture is worth a thousand words</Text>. They exist in every language and native speakers barely even notice them.
        However, if you try talking to someone who grew up speaking a different language
        you will occasionally notice blank stares when you use one.
      </Paragraph>
      <Paragraph>
        This realization is the genesis of this site. The goal of Idiomatically is to provide a repository of idioms across
        different languages and countries (Idioms in a language are not ubiquitous in all countries speaking that language). It
        also provides relationships between different languages.
      </Paragraph>
      <Paragraph>
        For example, to express <Text strong>Kill two birds with one stone</Text> in Bulgarian, Idiomatically will
        direct you to <Text strong>С един куршум - два заека</Text> (Kill two rabbits with one bullet). It is interesting
        to watch how different languages can express the same concept in seemingly similar but often interestingly different ways.
      </Paragraph>
      <Paragraph>
        Every idiom page allows you to explore all the equivalent idioms in different languages/countries as a list and as an interactive map.
        <img id="equivalentMapExample" src="static/equivalentMap.png" alt="interactive map of idioms" />
      </Paragraph>
      <Title level={3}>Sources</Title>
      <Paragraph>
        <Text>
          Content on the site is gathered directly from native speakers or sourced from sites across the internet like {" "}
          <a href="https://www.wiktionary.org/" target="_blank" rel="noopener noreferrer">
            Wiktionary{" "}
          </a>
          under the{" "}
          <a href="https://creativecommons.org/licenses/by-sa/3.0/" target="_blank" rel="noopener noreferrer">
            Creative Commons Attribution-ShareAlike License
          </a>
          . Content sourced from another site will provide a link to the original page.
        </Text>
      </Paragraph>

      <Title level={3}>Contributing</Title>
      <Paragraph>
        <Text>We welcome contributions of new idioms or relations between idioms. Just sign in
        and you can submit changes. Submissions go through a quick review process before they are made public.
        </Text>
      </Paragraph>

      <Title level={3}>Feedback</Title>
      <Paragraph>
        <Text>If you have questions or want to report a bug, please reach out by filing an issue on the <a href="https://github.com/mmanela/idiomatically" target="_blank" rel="noopener noreferrer">GitHub repo</a>.
        </Text>
      </Paragraph>
    </article>
  );
};
