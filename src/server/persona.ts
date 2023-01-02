/**
 * @fileoverview Controller class for persona messages.
 */

// TODO: Support different text generation API's; DeepAI, WriteSonic, et al.

import {ChatGPTAPI, ChatGPTAPIBrowser} from 'chatgpt';
import {oraPromise} from 'ora';
import plugins from './chat-rules';
import {IChatResponseParse} from './chat-parsers';
import {ChatConfigure} from './chat-config';
import {COLORS} from '../globals';

/** Duration to wait for response from ChatGPT server. */
const TIMEOUT = 2 * 60 * 1000;

export class Persona {
  /** ChatGPT API instance. */
  private api_: ChatGPTAPI | ChatGPTAPIBrowser;

  /** ChatGPT API rules configuration. */
  private config_: ChatConfigure;

  /** Color of messages from Persona. */
  public color: string = COLORS[0];

  /** ChatGPT API conversation ID; to maintain continuity between responses. */
  public conversationId?: string;

  /** ChatGPT API message ID of parent. */
  public messageId?: string;

  constructor(api: ChatGPTAPI | ChatGPTAPIBrowser, color?: string) {
    this.api_ = api;
    this.config_ = new ChatConfigure(plugins, this.api_);
    this.setColor_(color);
  }

  /** Initializes Persona instance. */
  public async init(notes: string[], color?: string) {
    this.config_.rules = this.config_.rules.concat(notes);
    this.setColor_(color);

    await oraPromise(this.config_.train(), {
      text: `🎭 Learned (${this.config_.rules.length} rules, ${this.config_.parsers.length} parsers)`,
    });
  }

  /** Sends message to ChatGPT API. */
  public async ask(message: string): Promise<IChatResponseParse> {
    const conversationId = this.config_.conversationId;
    const parentMessageId = this.config_.messageId;
    const reply = <IChatResponseParse>await oraPromise(
      this.api_.sendMessage(message, {
        conversationId,
        parentMessageId,
        timeoutMs: TIMEOUT,
      }));
    reply.images = [];

    const parsedReply = this.config_.parse(reply);

    return parsedReply;
  }

  /** Sets color to value given or stays the same. */
  private setColor_(value?: string) {
    if (value) this.color = value;
  }
}
