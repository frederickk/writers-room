import fetch from 'node-fetch';
import {ChatResponse} from 'chatgpt';

export interface IChatResponseParse extends ChatResponse {
  images: Array<string>;
}

interface IRegexMatchObj {
  str: string;
  arr: string[];
}

/** Searches given string to find string(s) that matches given RegExp. */
const findRegexMatches_ = async (regex: RegExp, str: string,
    callback: (str: string) => any): Promise<IRegexMatchObj> => {
  const matches = str.match(regex);
  const arr: Array<string> = [];

  if (matches?.length) {
    for (const match of matches) {
      const foundStr = match.replace(regex, '$1').trim();
      const replaceStr = await callback(foundStr);
      arr.push(replaceStr);

      // replace entire found string with ''
      str = str.replace(match.replace(regex, '$&'), '');
    }
  }

  return {str, arr};
};

/** Converts URL to Markdown image tag. */
export const URLtoMarkdownImage = async (reply: IChatResponseParse) => {
  const regex = /\{\{(https?:\/\/[^\s]+)\}\}/gm;
  // const regex = /(?:https?|ftp):\/\/[\n\S]+/gm;
  // const regex = /\s+(https?:\/\/[^\s]+)\s+/gm;
  // Match anything that might be a URL that is not a valid Markdown URL.
  // https://regex101.com/r/iVQvEu/1
  // const regex = /(?<!\]\()https?:\/\/.*?\.[a-zA-Z]{1,6}/gm;
  const url = await findRegexMatches_(regex, reply.response, async (str) => {
    const regex = /^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n\?\=]+)/gim;
    const domain = regex.exec(str)?.at(1);

    return `![${domain}](${str})`;
  });
  reply.response = url.str;
  reply.images = [...reply.images, ...url.arr].filter(n => n);

  return reply;
};

/** Converts image description to Lexica URL and Markdown image tag. */
export const descriptionToImage = async (reply: IChatResponseParse) => {
  console.log('///////////////////////////');
  console.log('LEXICA PARSE');
  // Match anything between {{ }}
  const regex = /\{\{([^\]]+?)\}\}/gm;
  const lexicaUrl = await findRegexMatches_(regex, reply.response, async (str) => {
    if (str.includes('http')) return '';

    const response = await fetch(
      `https://lexica.art/api/v1/search?q=${encodeURIComponent(str)}`, {
        method: 'GET',
      }
    );
    const json: any = await response.json();
    if (json?.images) {
      return `![${str}](https://image.lexica.art/md/${json?.images[0]?.id})`;
    }

    return '';
  });
  reply.response = lexicaUrl.str;
  reply.images = [...reply.images, ...lexicaUrl.arr].filter(n => n);

  return reply;
};
