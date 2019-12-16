import { FullIdiomEntry } from "../__generated__/types";
import { Form, Input, Tooltip, Button, Icon } from "antd";
import { GetFieldDecoratorOptions } from "antd/lib/form/Form";
import TextArea from "antd/lib/input/TextArea";
import { LanguageSelect } from "./LanguageSelect";
import { CountrySelect } from "./CountrySelect";
import * as React from "react";

export const tailFormItemLayout = {
  wrapperCol: {
    xs: {
      span: 24,
      offset: 0
    },
    sm: {
      span: 16,
      offset: 8
    }
  }
};

export function commonFormItems(
  getFieldDecorator: (id: string, options?: GetFieldDecoratorOptions) => (node: React.ReactNode) => React.ReactNode,
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
        label={
          <span>
            Idiom (In the langauges own alphabet) &nbsp;
            <Tooltip title="eg. Water under the bridge or 一石二鸟">
              <Icon type="question-circle-o" />
            </Tooltip>
          </span>
        }
      >
        {getFieldDecorator("title", {
          initialValue: existingValues.title,
          rules: [
            {
              required: true,
              message: "An Idiom is required",
              whitespace: true,
              max: 1000
            }
          ]
        })(<Input autoComplete="off" />)}
      </Form.Item>

      {
        <Form.Item
          label={
            <span>
              Language&nbsp;
              <Tooltip title="The language of the idiom">
                <Icon type="question-circle-o" />
              </Tooltip>
            </span>
          }
        >
          {isCreate &&
            setLanguageKey &&
            getFieldDecorator("languageKey", {
              initialValue: languageKey,
              rules: [
                {
                  required: true,
                  message: "Unknown language",
                  whitespace: true
                }
              ]
            })(<LanguageSelect onChange={lk => setLanguageKey(lk)} />)}
          {!isCreate && <span className="ant-form-text">{existingValues!.language!.languageName}</span>}
        </Form.Item>
      }
      <Form.Item
        label={
          <span>
            Country&nbsp;
            <Tooltip title="The countries where this idiom is used in that language">
              <Icon type="question-circle-o" />
            </Tooltip>
          </span>
        }
      >
        {getFieldDecorator("countryKeys", {
          initialValue: existingCountries,
          rules: [
            {
              required: true,
              message: "Unknown country",
              whitespace: true,
              type: "array"
            }
          ]
        })(<CountrySelect initialValue={existingCountries} languageKey={languageKey} />)}
      </Form.Item>

      {!isEnglish && (
        <Form.Item
          label={
            <span>
              Literal Translation (In English)&nbsp;
              <Tooltip title="Translate the idiom word for word to English (if it is not already English)">
                <Icon type="question-circle-o" />
              </Tooltip>
            </span>
          }
        >
          {getFieldDecorator("literalTranslation", {
            initialValue: existingValues.literalTranslation,
            rules: [
              {
                message: "The literal translation is too long",
                whitespace: true,
                max: 1000,
                required: true
              }
            ]
          })(<Input autoComplete="off" />)}
        </Form.Item>
      )}

      <Form.Item
        label={
          <span>
            Description&nbsp;
            <Tooltip title="Details about the idiom (markdown supported)">
              <Icon type="question-circle-o" />
            </Tooltip>
          </span>
        }
      >
        {getFieldDecorator("description", {
          initialValue: existingValues.description,
          rules: [
            {
              message: "Please enter a valid description",
              whitespace: true,
              max: 10000
            }
          ]
        })(<TextArea rows={15} />)}
      </Form.Item>

      {!isEnglish && !isCreate && (
        <Form.Item
          label={
            <span>
              Transliteration (How to pronounce it with English characters)&nbsp;
              <Tooltip title="Write the idiom into English letters to aid in pronunciation (like Pinyin for Chinese)">
                <Icon type="question-circle-o" />
              </Tooltip>
            </span>
          }
        >
          {getFieldDecorator("transliteration", {
            initialValue: existingValues.transliteration,
            rules: [
              {
                message: "The transliteration is too long",
                whitespace: true,
                max: 1000
              }
            ]
          })(<Input />)}
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
