import {ButtonDebounce} from './controller-button-debounce';
import {html} from 'lit';
import {customElement, property, query} from 'lit/decorators.js';

// @ts-ignore
import Style from './controller-button-debounce.scss';

@customElement('button-toggle')
export class ButtonToggle extends ButtonDebounce {
  constructor() {
    super();
  }

  static get styles() {
		return [Style];
  }

  @property({type: Number})
  state_ = 0;

  @property({type: String})
  active = 'primary';

  @query('#primary')
  private valuePrimaryElem_!: HTMLElement;

  @query('#alternate')
  private valueAltElem_!: HTMLElement;

  render() {
    return html `
      <button
          active="${this.active}"
          class="button"
          id="${this.id}"
          ?disabled=${this.disabled}
          @click="${this.clickHandler_}">
        <span id="off">
          <slot name="off">primary</slot>
        </span>
        <span id="on" class="button--hidden">
          <slot name="on">alternate</slot>
        </span>
      </button>
    `;
  }

  /** Adjusts state of element based on 'active' property. */
  updated(changedProperties: Map<string, any>) {
    if (changedProperties.has('active')) {
      const active = changedProperties.get('active');
      if (active === 'primary') {
        this.state_ = 0;
        this.valuePrimaryElem_.classList.add('button--hidden');
        this.valueAltElem_.classList.remove('button--hidden');
      } else if (active === 'alternate') {
        this.state_ = 1;
        this.valuePrimaryElem_.classList.remove('button--hidden');
        this.valueAltElem_.classList.add('button--hidden');
      }
    }
  }

  /** Handles button clicks, fires both 'click-debounce' and value events. */
  clickHandler_() {
    super.clickHandler_();

    this.toggleState_();

    let eventName = (<HTMLElement>this.valuePrimaryElem_.children[0]).innerHTML;
    if (this.state_ === 1) {
      eventName =(<HTMLElement>this.valueAltElem_.children[0]).innerHTML;
    }
    const event = new CustomEvent(eventName.toLowerCase(), {
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(event);

    this.requestUpdate();
  }

  /** Toggles classes of value slots. */
  toggleState_() {
    this.state_ = (this.state_ === 0 ? 1 : 0);
    this.valuePrimaryElem_.classList.toggle('button--hidden');
    this.valueAltElem_.classList.toggle('button--hidden');
  }
}