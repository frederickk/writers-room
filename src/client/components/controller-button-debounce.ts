import {html, LitElement} from 'lit';
import {customElement, property} from 'lit/decorators.js';

// @ts-ignore
import Style from './controller-button-debounce.scss';

@customElement('button-debounce')
export class ButtonDebounce extends LitElement {
  /** Timeout time handler. */
  private timeout_?: number;

  constructor() {
    super();
  }

  static get styles() {
		return [Style];
  }

  @property({type: Boolean})
  disabled = false;

  render() {
    return html `
      <button
          class="button"
          ?disabled=${this.disabled}
          @click="${this.clickHandler_}">
        <slot></slot>
      </button>
    `;
  }

  /** Briefly (1000ms) disables the button to prevent rapid clicks. */
  debounce_() {
    this.disabled = true;
    this.timeout_ = window.setTimeout(() => {
      this.disabled = false;
      window.clearTimeout(this.timeout_);
    }, 1000);
  }

  /** Handles 'click' events and fires 'click-debounce' event. */
  clickHandler_() {
    this.debounce_();
    const event = new CustomEvent('click-debounce', {
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(event);
  }
}

