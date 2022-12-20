import {html, LitElement} from 'lit';
import {customElement, property} from 'lit/decorators.js';

// @ts-ignore
import Style from './controller-chat-pending.scss';

@customElement('chat-pending')
export class ChatPending extends LitElement {
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
        class="chat-pending ${(this.visible)?'chat--visible':''}"
        ?visible=${this.visible}>
      <span class="chat-pending__dot"></span>
      <span class="chat-pending__dot"></span>
      <span class="chat-pending__dot"></span>
    </div>
    `;
  }
}




