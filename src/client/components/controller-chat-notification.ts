import {html, LitElement} from 'lit';
import {customElement, property} from 'lit/decorators.js';

// @ts-ignore
import Style from './controller-chat-notification.scss';

@customElement('chat-notification')
export class ChatNotification extends LitElement {
  constructor() {
    super();
  }

  static get styles() {
		return [Style];
  }

  @property({type: Boolean})
  visible = false;

  render() {
    return html `
    <div
        class="chat chat-notification ${(this.visible)?'chat--visible':''}"
        ?visible=${this.visible}>
      <slot></slot>
    </div>
    `;
  }
}
