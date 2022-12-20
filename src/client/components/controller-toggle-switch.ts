import {html, LitElement} from 'lit';
import {customElement, property, query} from 'lit/decorators.js';

// @ts-ignore
import Style from './controller-toggle-switch.scss';

@customElement('toggle-switch')
export class ToggleSwitch extends LitElement {
  constructor() {
    super();
  }

  static get styles() {
		return [Style];
  }

  @property({type: Boolean})
  switched = false;

  @property({type: Boolean})
  disabled = false;

  @query('input[type="checkbox"]')
  input_!: HTMLInputElement;

  render() {
    return html `
      <slot name="off">off</slot>
      <label>
        <input
          type="checkbox"
          ?checked=${this.switched}
          ?disabled=${this.disabled}
          @click="${this.clickHandler_}">
        <span class="slider slider--round"></span>
      </label>
      <slot name="on">on</slot>
      `;
  }

  get checked() {
    this.switched = this.input_.checked;
    return this.switched;
  }

  set checked(value: boolean) {
    this.switched = value;
  }

  /** Handles 'click' events and fires 'toggle-on' or 'toggle-off' event. */
  clickHandler_() {
    console.log(this.switched);
    let event;
    if (this.switched) {
      event = new CustomEvent('toggle-on', {
        bubbles: true,
        composed: true,
      });
    } else {
      event = new CustomEvent('toggle-off', {
        bubbles: true,
        composed: true,
      });
    }
    this.dispatchEvent(event);
  }
}

