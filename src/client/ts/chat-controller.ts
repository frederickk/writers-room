/**
 * @fileoverview Controller class for chat messages.
 */

import marked from './marked';
import {delay, randomFlex} from './utils';
import '../components/controller-chat-message';
import '../components/controller-chat-notification';
import '../components/controller-chat-pending';

export interface IChatAttributes {
  color?: string;
  elem?: HTMLElement;
  img?: string;
  name?: string;
  position?: string;
  text?: string;
}

/** Delay time between reveal of response. */
const DELAY_MS = 1000;

/** Scroll into view animation attribute.. */
const SCROLL_VIEW_ATTR: ScrollIntoViewOptions = {
  behavior: 'smooth',
  block: 'start', //'center',
  inline: 'center',
};

export class ChatController {
  /** Container element for all chat messages. */
  private container_ = document.querySelector('.chat-container');

  constructor(container?: HTMLElement) {
    if (container) this.container_ = container;
    if (this.container_) {
      this.container_.scrollTo(0, 0);
    }
  }

  /** Clones chat element and sets attributes. */
  private getChatElem_(attr?: IChatAttributes): HTMLElement {
    const elem = attr?.elem || document.createElement('chat-message');
    if (attr?.color) elem.setAttribute('color', attr.color);
    if (attr?.img) elem.setAttribute('img', attr.img);
    if (attr?.name) elem.setAttribute('name', attr.name);
    if (attr?.position) elem.setAttribute('position', attr.position);
    if (attr?.text) elem.innerHTML = marked.parse(attr.text);

    this.container_?.appendChild(elem);

    return elem;
  }

  /** Adds new chat message container to chat container. */
  public async message(attr: IChatAttributes): Promise<HTMLElement> {
    const elem = this.getChatElem_(attr);
    elem.removeAttribute('pending');

    await delay(randomFlex(DELAY_MS));

    return new Promise((resolve, reject) => {
      try {
        window.setTimeout(() => {
          elem.setAttribute('visible', 'true');
          elem.scrollIntoView(SCROLL_VIEW_ATTR);
          resolve(elem);
        }, DELAY_MS);
      } catch (err) {
        elem.remove();
        reject(err);
      } finally {
        if (elem.innerHTML.trim() === '') {
          elem.remove();
          reject();
        }
      }
    });
  }

  /** Adds new chat notification to chat container. */
  public async notify(attr?: IChatAttributes): Promise<HTMLElement> {
    const elem = document.createElement('chat-notification');
    elem.innerHTML = `<div>${attr?.text}</div>`;

    this.container_?.appendChild(elem);

    return new Promise((resolve, reject) => {
      try {
        window.setTimeout(() => {
          elem.setAttribute('visible', 'true');
          elem.scrollIntoView(SCROLL_VIEW_ATTR);
          resolve(elem);
        }, DELAY_MS);
      } catch (err) {
        elem.remove();
        reject(err);
      }
    });
  }

  /** Adds new chat message with pending dots to chat container. */
  public async pending(attr: IChatAttributes): Promise<HTMLElement> {
    const elem = this.getChatElem_(attr);
    elem.innerHTML = '';
    elem.setAttribute('pending', 'true');
    elem.setAttribute('visible', 'true');
    elem.scrollIntoView(SCROLL_VIEW_ATTR);

    return elem;
  }
}
