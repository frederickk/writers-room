import {html, LitElement} from 'lit';
import {customElement, property, query} from 'lit/decorators.js';

// @ts-ignore
import Style from './controller-chat-message.scss';

@customElement('chat-message')
export class ChatMessage extends LitElement {
  constructor() {
    super();
  }

  static get styles() {
		return [Style];
  }

  @property({type: String})
  name = '';

  @property({type: String})
  color = 'yellow';

  @property({type: String})
  img = '';

  @property({type: String})
  pending = 'true';

  @property({type: String})
  position = 'left';

  @property({type: Boolean})
  visible = false;

  @query('chat-pending')
  pendingElem_!: HTMLElement;

  render() {
    return html `
      <div
          class="chat chat__message ${(this.visible)?'chat--visible':''} ${(!this.img)?'chat--self':''} chat--${this.position}"
          ?color=${this.color}
          ?pending="${this.pending}"
          ?visible=${this.visible}>
      ${this.img
          ? html `<div class="chat-avatar"><img src="${this.img}"></div>`
          : html``}
      <div class="chat-name">
        ${this.name
          ? html`<span class="chat-id">${this.name}</span>`
          : html``}
      </div>
      <div class="chat-message chat--${this.color}">
        <slot></slot>
        <chat-pending ?visible=${this.pending === 'true'}></chat-pending>
      </div>
    </div>
    `;
  }

  async firstUpdated() {
    try {
      const color = await fetch(`/color/${this.name.toLowerCase()}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/html',
        },
      })
        .then((res) => res.text());
      this.color = color;
    } catch(err) {}
  }
}
