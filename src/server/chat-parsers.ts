import fetch from 'node-fetch';
import {ChatResponse} from 'chatgpt';
import {findRegexMatches} from '../utils';

export interface IChatResponseParse extends ChatResponse {
  images: Array<string>;
}

/** Converts URL to Markdown image tag. */
export const URLtoMarkdownImage = async (reply: IChatResponseParse) => {
  const regex = /\{\{(https?:\/\/[^\s]+)\}\}/gm;
  // const regex = /(?:https?|ftp):\/\/[\n\S]+/gm;
  // const regex = /\s+(https?:\/\/[^\s]+)\s+/gm;
  // Match anything that might be a URL that is not a valid Markdown URL.
  // https://regex101.com/r/iVQvEu/1
  // const regex = /(?<!\]\()https?:\/\/.*?\.[a-zA-Z]{1,6}/gm;
  const url = await findRegexMatches(regex, reply.response, async (str) => {
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
  // Match anything between {{ }}
  const regex = /\{\{([^\]]+?)\}\}/gm;

  const lexicaUrl = await findRegexMatches(regex, reply.response, async (str) => {
    if (str.includes('http')) return '';

    const response = await fetch(
      `https://lexica.art/api/v1/search?q=${encodeURIComponent(str)}`, {
        method: 'GET',
      }
    );
    const json: any = await response.json();
    if (json?.images) {
      const index = Math.floor(Math.random() * (json.images.length / 2)) % json.images.length;
      return `![${str}](https://image.lexica.art/md/${json?.images[index]?.id})`;
    }

    return '';
  });
  reply.response = lexicaUrl.str;
  reply.images = [...reply.images, ...lexicaUrl.arr].filter(n => n);

  return reply;
};
