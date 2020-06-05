import { FullIdiomEntry } from "../__generated__/types";
import { Input, Tooltip, Button, Form } from "antd";
import { QuestionCircleOutlined } from '@ant-design/icons';
import { LanguageSelect } from "./LanguageSelect";
import { CountrySelect } from "./CountrySelect";
import * as React from "react";
import { MarkdownEditor } from "./MarkdownEditor";

export const tailFormItemLayout = {
  wrapperCol: {
    xs: {
      span: 4,
      offset: 0
    },
    sm: {
      span: 4,
      offset: 10
    }
  }
};

export function commonFormItems(
  actionInProgress?: boolean,
  setLanguageKey?: React.Dispatch<React.SetStateAction<string>>,
  languageKey?: string,
  existingValues?: Partial<FullIdiomEntry>
) {
  const isCreate = !existingValues;
  existingValues = existingValues || {};
  languageKey = languageKey || (existingValues.language && existingValues.language.languageKey);
  const isEnglish = languageKey === "en";

  const existingCountries = existingValues.language && existingValues.language.countries.map(x => x.countryKey);

  return (
    <>
      <Form.Item
        name="title"
        rules={[
          {
            required: true,
            message: "An Idiom is required",
            whitespace: true,
            max: 1000
          }
        ]}
        label={
          <span>
            Idiom (In the langauges own alphabet) &nbsp;
            <Tooltip title="eg. Water under the bridge or 一石二鸟">
              <QuestionCircleOutlined />
            </Tooltip>
          </span>
        }
      >
        <Input autoComplete="off" />
      </Form.Item>
      <Form.Item
        name="languageKey"
        rules={isCreate &&
          setLanguageKey ?
          [
            {
              required: true,
              message: "Unknown language",
              whitespace: true
            }
          ] : []}
        label={
          <span>
            Language&nbsp;
              <Tooltip title="The language of the idiom">
              <QuestionCircleOutlined />
            </Tooltip>
          </span>
        }
      >
        <LanguageSelect
          readOnly={!isCreate}
          readOnlyText={existingValues && existingValues.language && existingValues.language.languageName}
          onChange={lk => setLanguageKey && setLanguageKey(lk)} />
      </Form.Item>
      <Form.Item
        name="countryKeys"
        rules={[
          {
            required: true,
            message: "Unknown country",
            whitespace: true,
            type: "array"
          }
        ]}
        label={
          <span>
            Country&nbsp;
            <Tooltip title="The countries where this idiom is used in that language">
              <QuestionCircleOutlined />
            </Tooltip>
          </span>
        }
      >
        <CountrySelect initialValue={existingCountries} languageKey={languageKey} />
      </Form.Item>

      {!isEnglish && (
        <Form.Item
          name="literalTranslation"
          rules={[
            {
              message: "The literal translation is required",
              whitespace: true,
              max: 1000,
              required: true
            }
          ]}
          label={
            <span>
              Literal Translation (In English)&nbsp;
              <Tooltip title="Translate the idiom word for word to English (if it is not already English)">
                <QuestionCircleOutlined />
              </Tooltip>
            </span>
          }
        >
          <Input autoComplete="off" />
        </Form.Item>
      )}

      <Form.Item
        name="description"
        rules={[
          {
            message: "Please enter a valid description",
            whitespace: true,
            max: 10000
          }
        ]}
        label={
          <span>
            Description&nbsp;
            <Tooltip title="Details about the idiom (markdown supported)">
              <QuestionCircleOutlined />
            </Tooltip>
          </span>
        }
      >
        <MarkdownEditor />
      </Form.Item>

      {!isEnglish && !isCreate && (
        <Form.Item
          name="transliteration"
          rules={[
            {
              message: "The transliteration is too long",
              whitespace: true,
              max: 1000
            }
          ]}
          label={
            <span>
              Transliteration (How to pronounce it with English characters)&nbsp;
              <Tooltip title="Write the idiom with Latin characters to aid in pronunciation (like Pinyin for Chinese)">
                <QuestionCircleOutlined />
              </Tooltip>
            </span>
          }
        >
          <Input />
        </Form.Item>
      )}

      <Form.Item {...tailFormItemLayout}>
        <Button type="primary" htmlType="submit" disabled={actionInProgress}>
          Submit
        </Button>
      </Form.Item>
    </>
  );
}
