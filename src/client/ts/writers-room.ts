/**
 * @fileoverview Instantiates a Writers' Room instance.
 */

import {chatAPIResponseHandler, colorResponseHandler} from './api-handlers';
import {ChatController, IChatAttributes} from './chat-controller';
import {delay, toTitleCase} from '../../utils';
import {SummaryBlock} from '../components/controller-summary-block';

/** Delay time between triggering persona responses. */
const DELAY_MS = 1 * 500;

/** Notification message strings. */
const NOTIFICATIONS: {[key:string]: string;} = {
  error: `Something went wrong with response, try again?`,
  group: `Group conversation mode`,
  invalid: `is not in this room`,
  join: `joined the room`,
  load: `You created this writers' room today with <span class="chat-message__mention">@janet</span>, <span class="chat-message__mention">@marge</span>, and <span class="chat-message__mention">@rita</span>`,
  single: `Single conversation mode`,
};

/** Response mode psuedo-ENUM. */
const MODE: {[key:string]: boolean;} = {
  group: true,
  single: false,
};

export class WritersRoom {
  /** Chat instance which controls flow of information to OpenAI. */
  private chat_ = new ChatController();

  /** Buttons to trigger prompts. */
  private elemsButton_: { [key: string]: HTMLButtonElement; };

  /** Input elements of prompts. */
  private elemsInput_: { [key: string]: HTMLInputElement; };

  /** Summary container element. */
  private elemSummary_: SummaryBlock = document.querySelector('summary-block')!;

  /** Mode for responses. */
  private responseMode_ = MODE.group;

  /** Array of persona names. */
  private personaNames_: string[];

  /** Object containing all persona responses. */
  private personaResponses_: {[key: string]: string[]} = {}

  /** User prompt for pre-pending AI messages. */
  private userPrompt_: string = '';

  /** Number of response sent. */
  public messageCount = 0;

  /** Last persona to respond. */
  public nextSpeaker: string = '';

  constructor(personaNames: string[]) {
    this.personaNames_ = personaNames;

    // Set default next speaker, to first persona.
    this.nextSpeaker = this.personaNames_[0];

    this.elemsButton_ = {
      user: document.querySelector('#ask')!,
    };
    this.elemsInput_ = {
      mode: document.querySelector('#mode')!,
      user: document.querySelector('#prompt')!,
    };

    for (const name of this.personaNames_) {
      const name_ = name.toLowerCase();
      this.elemsButton_[name_] = document.querySelector(`#ask-${name_}`)!;
      this.elemsInput_[name_] = document.querySelector(`#prompt-${name_}`)!;
      this.personaResponses_[name_] = [];
    }

    this.initListeners_();
    this.init_();
  }

  /** Initializes the Writers' Room. */
  private async init_() {
    await this.chat_.notify({
      text: NOTIFICATIONS.load,
    });
    await this.setModeState_();
    this.modeHandler_();
  }

  /** Adds event listeners to elements. */
  private initListeners_() {
    this.elemsInput_.mode
      .addEventListener('toggle-off', this.modeHandler_.bind(this));

    this.elemsInput_.mode
      .addEventListener('toggle-on', this.modeHandler_.bind(this));

    this.elemsInput_.user
      .addEventListener('enter', () => this.initMessage_('user'));

    this.elemsButton_.user
      .addEventListener('click', this.submitHandler_.bind(this));

    this.elemsInput_.user
      .addEventListener('submit', this.submitHandler_.bind(this));

    this.elemsInput_.user
      .addEventListener('empty', () => this.removeMessage_('user'));
  }

  /** Adds error state to element for 1 second. */
  private addError_(elem: HTMLButtonElement | HTMLInputElement): Promise<void> {
    return new Promise((resolve, _reject) => {
      elem.toggleAttribute('error', true);
      window.setTimeout(() => {
        elem.removeAttribute('error');
        resolve();
      }, DELAY_MS);
    });
  }

  /** Creates chat container with message. */
  private async createMessage_(id: string, text?: string)
      : Promise<HTMLElement | undefined> {
    if (!text) {
      await this.addError_(this.elemsInput_.user);
      await this.errorHandler_(id);

      return;
    }

    // Search for pending element by ID.
    const elem = await <HTMLElement>document.querySelector(`#${id}`);
    // Discard ID attribute since we won't need to reference this element.
    elem?.removeAttribute('id');
    // Temporarily disable user input, to prevent duplicative requests.
    // TODO: removing attribute isn't working.
    // this.elemsInput_.user.toggleAttribute('disabled', false);
    // this.elemsButton_.user.toggleAttribute('disabled', false);

    // Pass element and text to message instantiator.
    return await this.chat_.message({
      elem,
      text,
      position: elem?.getAttribute('position') || 'left',
    });
  }

  /** Handles message errors and posts notification. */
  private async errorHandler_(id: string, text = NOTIFICATIONS.error) {
    this.removeMessage_(id);
    if (text) await this.chat_.notify({
      text,
    });
    this.setModeState_();
  }

  /** Handles asking last speaker a message from the user. */
  private async fetchMessage_(id: string, name?: string, text?: string):
      Promise<string | null> {

    // Prepend original user input to prompt.
    if (!text?.includes(this.userPrompt_)) {
      text = `${this.userPrompt_}\n${text}`;
    }

    const text_ = text || this.elemsInput_.user.value;
    this.userPrompt_ = text_;
    const name_ = name?.toLowerCase() || this.nextSpeaker.toLowerCase();
    const color = await colorResponseHandler(name_)
      .then((res) => res.text());

    await this.initMessage_(id, {
      color,
      img: `/avatars/${name_}/`,
      name: toTitleCase(name_),
      position: 'left',
    });

    try {
      const msg = await chatAPIResponseHandler(`ask/${name_}`, text_);
      this.setModeState_();
      // Clear query from user input.
      this.elemsInput_.user.value = '';
      // Remove disabled states from user input.
      // TODO: removing attribute isn't working.
      // this.elemsInput_.user.toggleAttribute('disabled', true);
      // this.elemsButton_.user.toggleAttribute('disabled', true);

      return msg
    } catch (err) {
      this.errorHandler_(id);

      return null;
    }
  }

  /** Fetches response from next speaker. */
  private async fetchResponseNextSpeaker_(name: string, text: string) {
    const name_ = this.getMention_(text) || name;
    const msg = await this.fetchMessage_(`persona-${name_}`, name_, text);

    if (msg && this.getMentionValid_(name_)) {
      this.postMessage_(name_,msg);

      if (this.responseMode_ === MODE.group) {
        delay(DELAY_MS).then(() => {
          this.fetchResponseNextSpeaker_(this.nextSpeaker, msg);
        });
      }
    } else {
      this.errorHandler_(`persona-${name_}`);
    }
  }

  /** Retrieves mentions (@foo) from a string of text.  */
  private getMention_(str: string): string | undefined {
    const regex = /@([^\s]+)/gmi;
    const match = str.match(regex);

    if (match) return match[0]
      // .replace(/\W/gi, '')
      .replace(/[^a-z]+/gi, '')
      .toLowerCase();

    return;
  }

  /** Confirms that given mention string is a valid Persona. */
  private getMentionValid_(str: string):boolean {
    const isValidMention = this.personaNames_
      .findIndex(name => str.toLowerCase() === name.toLowerCase()) !== null;

    if (!isValidMention) {
      this.chat_.notify({
        text: `"${str}}" ${NOTIFICATIONS.invalid}`,
      });
    }

    return isValidMention;
  }

  /** Returns mode state; 'single' or 'group'. */
  private getModeState_(): string {
    this.responseMode_ = this.elemsInput_.mode.checked;
    return (this.responseMode_ === MODE.single)
      ? 'single'
      : 'group';
  }

  /** Creates pending message element. */
  private async initMessage_(id: string,
      attr: IChatAttributes = {position: 'right'}) {
    const elem = await this.chat_.pending(attr) ||
      document.querySelector(`#${id}`);
    if (id) elem.id = id;
    elem.toggleAttribute('visible', true);
    elem.setAttribute('position', attr?.position || 'right');

    return elem;
  }

  /** Pauses conversation between speakers. */
  private async modeHandler_() {
    await this.chat_.notify({
      text: NOTIFICATIONS[this.getModeState_()],
    });
  }

  /** Posts message to chat container. */
  private async postMessage_(name: string, msg: string) {
    this.createMessage_(`persona-${name}`, msg);
    // Push message into persona response array.
    this.personaResponses_[name].push(msg);
    // Pass messages to summary-block for summarization.
    this.elemSummary_.src = Object.values(this.personaResponses_)
      .flat(Infinity).join('\n');

    this.setNextSpeaker_();

    const mention = this.getMention_(msg);
    if (mention && this.getMentionValid_(mention)) {
      this.nextSpeaker = mention;
    }
  }

  /** Removes message element. */
  private removeMessage_(id?: string) {
    document.querySelector(`#${id}`)?.remove();
  }

  /** Sets state of Play/Pause button. */
  private setModeState_(state?: boolean) {
    const state_ = state || this.responseMode_;
    (this.elemsInput_.mode as HTMLInputElement).checked = state_;
  }

  /** Sets next speaker to pass conversation to. */
  private setNextSpeaker_(): string {
    const name = toTitleCase(this.nextSpeaker);
    const index = this.personaNames_.indexOf(name);
    this.nextSpeaker =
      (this.personaNames_[(index + 1) % this.personaNames_?.length])
        .toLowerCase();

    return this.nextSpeaker;
  }

  /** Handles user input submissions passes to persona and posts response. */
  private async submitHandler_() {
    await this.createMessage_('user', this.elemsInput_.user.value);
    this.setModeState_();
    this.fetchResponseNextSpeaker_(
      this.nextSpeaker.toLowerCase(),
      this.elemsInput_.user.value);
  }
}
