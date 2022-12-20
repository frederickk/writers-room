import {html, LitElement} from 'lit';
import {customElement, property, query} from 'lit/decorators.js';

// @ts-ignore
import Style from './controller-input-text.scss';

@customElement('input-text')
export class InputText extends LitElement {
  /** Has the user clicked the input? */
  private clickEnter_: boolean = false;

  /** Timeout time handler. */
  private timeout_?: number;

  constructor() {
    super();
  }

  static get styles() {
		return [Style];
  }

  @property({type: Number})
  delay = 3000;

  @property({type: Boolean})
  disabled = false;

  @property({type: Boolean})
  error = false;

  @property({type: String})
  placeholder = '';

  @property({type: String})
  value = '';

  @query('input.input')
  input_!: HTMLInputElement;

  render() {
    return html `
      <input
        class="input ${(this.error)?'input--error':''}"
        type="text"
        .placeholder="${this.placeholder}"
        .value="${this.value}"
        ?disabled=${this.disabled}
        ?error=${this.error}
        @input="${this.inputHandler_}"
        @keydown="${this.keydownHandler_}"
        @keyup="${this.keyupHandler_}"/>
    `;
  }

  /** Handles 'input' event and fires 'empty' event if value is null. */
  inputHandler_() {
    this.value = this.input_.value.trim();

    if (this.isEmpty_()) {
      this.clickEnter_ = false;
      const event = new CustomEvent('empty', {
        bubbles: true,
        composed: true,
      });
      this.dispatchEvent(event);
    }
  }

  isEmpty_() {
    return (this.input_.value.trim() === '' || this.input_.value == null);
  }

  /** Handles 'keydown' events and fires 'enter' event. */
  keydownHandler_(event: KeyboardEvent) {
    this.keySubmitHandler_(event);

    if (!this.clickEnter_) {
      this.clickEnter_ = true;
      const event = new CustomEvent('enter', {
        bubbles: true,
        composed: true,
      });
      this.dispatchEvent(event);
    }
  }

  /** Handles 'keyup' events and fires 'timeout' event. */
  keyupHandler_() {
    if (!this.timeout_) {
      this.timeout_ = window.setTimeout(() => {
        if (this.isEmpty_()) {
          this.clickEnter_ = false;
        }
        const event = new CustomEvent('timeout', {
          bubbles: true,
          composed: true,
        });
        this.dispatchEvent(event);
        window.clearTimeout(this.timeout_);
      }, this.delay);
    }
  }

  /** Handles CMD+Enter submission of input handler from user. */
  keySubmitHandler_(event: KeyboardEvent) {
    // TODO: Fix to not rely on keyCode.
    if (event.keyCode === 13 && (event.ctrlKey || event.metaKey)) {
      const event = new CustomEvent('submit', {
        bubbles: true,
        composed: true,
      });
      this.dispatchEvent(event);
    }
  };
}

