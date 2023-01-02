import {html, LitElement} from 'lit';
import {customElement, property, query} from 'lit/decorators.js';
import {oneAIResponseHandler} from '../ts/api-handlers';
import marked from '../ts/marked';

// @ts-ignore
import Style from './controller-summary-block.scss';

@customElement('summary-block')
export class SummaryBlock extends LitElement {
  constructor() {
    super();
  }

  static get styles() {
		return [Style];
  }

  @query('.summary-empty')
  private elemEmpty_!: HTMLElement;

  @query('.summary-content__text')
  private elemText_!: HTMLElement;

  @query('.summary-content__topics')
  private elemTopics_!: HTMLElement;

  @property({type: Boolean})
  isEmpty_ = true;

  @property({type: Boolean})
  open = false;

  @property({type: String})
  placeholder = 'Nothing to see here, yet...';

  @property({type: String})
  src = ''

  @property({type: String})
  value = '';

  render() {
    return html `
    <div
      class="summary-container"
      .placeholder="${this.placeholder}"
      .src="${this.src}"
      .value="${this.value}"
      ?open=${this.open}>
      <div class="summary-empty ${(this.isEmpty_)?'summary--visible':''}">${this.placeholder}</div>
      <div class="summary-content summary-content__topics ${(!this.isEmpty_)?'summary--visible':''}"></div>
      <div class="summary-content summary-content__text ${(!this.isEmpty_)?'summary--visible':''}">${this.value}</div>
      <div class="summary-content summary-content__imagery ${(!this.isEmpty_)?'summary--visible':''}"></div>
    </div>
    `;
  }

  /** Adjusts state of element based on 'open' property. */
  async willUpdate(_changedProperties: Map<string, any>) {
    if (this.hasUpdated && this.open && this.src) {
      this.isEmpty_ = await false;
      this.elemEmpty_.innerHTML = await `<chat-pending visible></chat-pending>`;

      const res = await oneAIResponseHandler(this.src);
      console.log(JSON.stringify(res, null, 2));

      await this.populateTopics_(res.topics);
      await this.populateSummaryText_(res.summary.text, res.stats.wordCount);
    } else {
      this.isEmpty_ = await true;
      // this.elemEmpty_.innerHTML = await this.placeholder;
    }
  }

  /** Populates summary text. */
  protected populateSummaryText_(text: string, wordcount?: number) {
    if (this.elemText_) {
      if (wordcount) this.elemText_.innerHTML = `<!-- div class="summary-content__text-wordcount">${wordcount} words</div -->`;
      this.elemText_.innerHTML += marked.parse(text);
    }
  }

  /** Populates topics container with topic tags. */
  protected populateTopics_(topics: any[]) {
    if (this.elemTopics_) {
      this.elemTopics_.innerHTML = '';
      for (const topic of topics) {
        this.elemTopics_.innerHTML += `<span class="summary-content__topic-label">${topic.value}</span>`;
      }
    }
  }

}

