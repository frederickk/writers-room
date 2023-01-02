/**
 * @fileoverview Middleware to apply 'chat-message__' class to Markdown elements
 * converted to HTML.
 */

import {marked} from 'marked';

const CLASSNAME = 'chat-message__'

const renderer = new marked.Renderer();

// Override <p> tags.
renderer.paragraph = (text: any) => {
  // TODO: Use Tokenizer, but it's full of errors and I've given up on finding
  // a solution.
  const regex = /@([^\s]+)/gmi;
  const match = text.match(regex);
  if (match) {
    text = text.replace(regex, `<span class="${CLASSNAME}mention">${match[0]}</span>`);
  }

  return `<p class="${CLASSNAME}p">${text}</p>`;
};

// Override <h#> tags.
renderer.heading = (text: any, level: any) => {
  return `<h${level} class="${CLASSNAME}h${level}">${text}</h${level}>`;
};

// Override <img> tags.
renderer.image = (href: any, _title: any, text: any) => {
  return `<img src="${href}" class="${CLASSNAME}img" title="${text}" alt="${text}" />`;
};

// Override <a> tags.
renderer.link = (href: any, title: any, text: any) => {
  return `<a href="${href}" class="${CLASSNAME}a" title="${title}">${text}</a>`;
};

// Override <li> tags.
renderer.listitem = (text: string, _task: boolean, _checked: boolean) => {
  return `<li class="${CLASSNAME}li">${text}</li>`;
};

// Override <p> tags.
renderer.strong = (text: any) => {
  return `<strong class="${CLASSNAME}strong">${text}</strong>`;
};

// Apply Marked options.
marked.setOptions({
  renderer,
  smartypants: true,
});

export default marked;