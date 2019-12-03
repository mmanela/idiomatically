import * as React from "react";
import { Typography } from "antd";
const { Title, Paragraph, Text } = Typography;

export const About: React.StatelessComponent = props => {
  return (
    <article>
      <Title level={2}>About Idiomatically</Title>
      <Paragraph>
        Idiomatically is a site all about ...{" "}
        <a href="https://www.wordnik.com/words/idiom" target="_blank" rel="noopener noreferrer">
          idioms
        </a>
        .
      </Paragraph>
      <Paragraph>
        Idioms are those expression that just don't make sense if you take them literally. But they are what make languages
        interesting and colorful. They are much more than the sum of their parts. They are the linguistic equivalent of a{" "}
        <Text underline>picture is worth a thousand words</Text>. Every language contains them and as a native speaker of the
        language you almost don't even notice. However, if you try talking to someone who grew up speaking a different language
        you will occasionally notice blank stares when you use one.
      </Paragraph>
      <Paragraph>
        This realization is the genesis of this site. The goal of Idiomatically is to provide a repository of idioms across
        different languages and countries (Idioms in a language are not ubiquitous in all countries speaking that language). It
        also provides relationships between different languages.
      </Paragraph>
      <Paragraph>
        For example, if you wanted to express <Text strong>Kill two birds with one stone</Text> in Bulgarian, Idiomatically will
        help you find to say <Text strong>С един куршум - два заека</Text> (Kill two rabbits with one bullet). It is interesting
        to watch how different languages can express the same concept in seemingly similar but often very different ways.
      </Paragraph>
      <Paragraph>
        <Text strong>Enjoy!</Text>
      </Paragraph>
    </article>
  );
};
