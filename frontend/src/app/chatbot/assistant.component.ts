import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CatalogService } from '../core/services/catalog.service';
import { Product } from '../core/models';
import { NavbarComponent } from '../shared/components/navbar/navbar.component';

interface ChatMessage {
  sender: 'user' | 'assistant';
  text: string;
  products?: Product[];
}

@Component({
  selector: 'app-assistant',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, NavbarComponent],
  template: `
    <app-navbar />
    <main class="chat-page container">
      <div class="chat-shell card">
        <div class="chat-header">
          <div>
            <h1>🤖 Local Shopping Assistant</h1>
            <p>Ask for products, prices, or open shops near you.</p>
          </div>
          <button class="btn btn-outline btn-sm" (click)="enableLocation()">
            {{ catalog.userLocation() ? '📍 Location Active' : '📍 Share Location' }}
          </button>
        </div>

        <div class="prompts-bar">
          @for (prompt of quickPrompts; track prompt) {
            <button class="prompt-chip" (click)="sendPrompt(prompt)">{{ prompt }}</button>
          }
        </div>

        <div class="messages-area">
          @for (msg of messages(); track $index) {
            <div class="msg" [class.user]="msg.sender === 'user'" [class.bot]="msg.sender === 'assistant'">
              <div class="bubble">{{ msg.text }}</div>
              @if (msg.products && msg.products.length > 0) {
                <div class="rec-grid">
                  @for (p of msg.products; track p.id) {
                    <div class="rec-card">
                      <div class="rec-top">
                        <strong>{{ p.name }}</strong>
                        <span class="rec-price">₹{{ p.price }}</span>
                      </div>
                      @if (p.shop) {
                        <p class="rec-shop">
                          {{ p.shop.name }} · {{ p.shop.city }}
                          @if (p.distanceKm !== null && p.distanceKm !== undefined) {
                            ({{ p.distanceKm }} km)
                          }
                        </p>
                        <div class="rec-links">
                          <a [routerLink]="['/shops', p.shop.id]">View Shop</a>
                          <a [href]="catalog.getDirectionsUrl(p.shop)" target="_blank" rel="noopener">Directions</a>
                        </div>
                      }
                    </div>
                  }
                </div>
              }
            </div>
          }

          @if (loading()) {
            <div class="msg bot">
              <div class="bubble">Searching nearby shops...</div>
            </div>
          }
        </div>

        <form class="chat-input-row" (ngSubmit)="send()">
          <input
            type="text"
            class="form-input"
            [(ngModel)]="input"
            name="message"
            placeholder="Ask e.g. 'Where can I buy running shoes under 2000?'"
          />
          <button class="btn btn-primary" type="submit" [disabled]="loading()">Send</button>
        </form>
      </div>
    </main>
  `,
  styles: [
    `
      .chat-page {
        padding: var(--space-6);
      }
      .chat-shell {
        max-width: 880px;
        margin: 0 auto;
        display: flex;
        flex-direction: column;
        min-height: 76vh;
      }
      .chat-header {
        padding: var(--space-5) var(--space-6);
        border-bottom: 1px solid var(--color-border-light);
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: var(--space-4);
        flex-wrap: wrap;
      }
      .chat-header h1 {
        font-size: var(--text-xl);
      }
      .chat-header p {
        font-size: var(--text-sm);
        color: var(--color-text-secondary);
      }
      .prompts-bar {
        display: flex;
        gap: var(--space-2);
        flex-wrap: wrap;
        padding: var(--space-3) var(--space-6);
        background: var(--color-bg);
        border-bottom: 1px solid var(--color-border-light);
      }
      .prompt-chip {
        padding: var(--space-1) var(--space-3);
        border-radius: var(--radius-full);
        border: 1px solid var(--color-border);
        background: white;
        font-size: var(--text-xs);
        cursor: pointer;
      }
      .prompt-chip:hover {
        border-color: var(--color-primary);
        color: var(--color-primary);
      }
      .messages-area {
        flex: 1;
        padding: var(--space-6);
        display: flex;
        flex-direction: column;
        gap: var(--space-4);
        overflow-y: auto;
      }
      .msg {
        display: flex;
        flex-direction: column;
        gap: var(--space-3);
      }
      .msg.user {
        align-items: flex-end;
      }
      .msg.bot {
        align-items: flex-start;
      }
      .bubble {
        max-width: 78%;
        padding: var(--space-3) var(--space-4);
        border-radius: var(--radius-xl);
        font-size: var(--text-sm);
      }
      .msg.user .bubble {
        background: var(--gradient-primary);
        color: white;
      }
      .msg.bot .bubble {
        background: var(--color-surface);
        color: var(--color-text-primary);
      }
      .rec-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
        gap: var(--space-3);
        width: 100%;
      }
      .rec-card {
        padding: var(--space-3);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-lg);
        background: white;
      }
      .rec-top {
        display: flex;
        justify-content: space-between;
        gap: var(--space-2);
        font-size: var(--text-sm);
      }
      .rec-price {
        font-weight: 700;
        color: var(--color-primary);
      }
      .rec-shop {
        font-size: var(--text-xs);
        color: var(--color-text-secondary);
        margin: var(--space-1) 0 var(--space-2);
      }
      .rec-links {
        display: flex;
        gap: var(--space-3);
        font-size: var(--text-xs);
        font-weight: 600;
      }
      .chat-input-row {
        display: flex;
        gap: var(--space-3);
        padding: var(--space-4) var(--space-6);
        border-top: 1px solid var(--color-border-light);
      }
    `,
  ],
})
export class AssistantComponent {
  readonly quickPrompts = [
    'Where can I buy pooja items?',
    'Running shoes under 2000',
    'Find rice 10kg near me',
    'Open bakery shops',
    'Fast mobile charger',
  ];

  input = '';
  loading = signal(false);
  messages = signal<ChatMessage[]>([
    {
      sender: 'assistant',
      text: 'Hi! Tell me what product or shop you are looking for, and I will find local sellers with live stock and directions.',
    },
  ]);

  constructor(public readonly catalog: CatalogService) {}

  async enableLocation(): Promise<void> {
    await this.catalog.requestLocation();
  }

  sendPrompt(prompt: string): void {
    this.input = prompt;
    this.send();
  }

  send(): void {
    const trimmed = this.input.trim();
    if (!trimmed || this.loading()) return;

    this.messages.update((list) => [...list, { sender: 'user', text: trimmed }]);
    this.input = '';
    this.loading.set(true);

    this.catalog.askAssistant(trimmed, this.catalog.userLocation()).subscribe({
      next: (res) => {
        this.messages.update((list) => [
          ...list,
          { sender: 'assistant', text: res.reply, products: res.products },
        ]);
        this.loading.set(false);
      },
      error: () => {
        this.messages.update((list) => [
          ...list,
          { sender: 'assistant', text: 'Sorry, something went wrong while searching.' },
        ]);
        this.loading.set(false);
      },
    });
  }
}
