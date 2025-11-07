import { Component, EventEmitter, Input, Output, signal, ViewEncapsulation } from '@angular/core';
import { LoreCard, EncryptedBundle } from '../../models';
import { CryptoService } from '../../services'

@Component({
  selector: 'app-lore-card',
  standalone: false,
  templateUrl: './lore-card.component.html',
  styleUrl: './lore-card.component.scss',
  // encapsulation: ViewEncapsulation.None,
})
export class LoreCardComponent {
  @Input() card!: LoreCard;
  @Input() editing = false;
  @Input() playerPass = '';
  @Input() gmPass = '';
  @Output() update = new EventEmitter<LoreCard>();
  @Output() remove = new EventEmitter<string>();

  playersDraft = '';
  gmDraft = '';

  private _playersText = signal<string | null>(null);
  private _gmText = signal<string | null>(null);

  constructor(
    private readonly cryptoSvc: CryptoService
  ) {}

  playersRevealed = () => this._playersText() !== null;
  gmRevealed = () => this._gmText() !== null;
  playersText = () => this._playersText();
  gmText = () => this._gmText();

  async reveal(kind: 'players' | 'gm') {
    try {
      if (kind === 'players' && this.card.playersEnc) {
        if (!this.playerPass) { alert('Enter Player Passphrase at the top.'); return; }
        const text = await this.cryptoSvc.decrypt(this.playerPass, this.card.playersEnc);
        this._playersText.set(text);
      }
      if (kind === 'gm' && this.card.gmEnc) {
        if (!this.gmPass) { alert('Enter GM Passphrase at the top.'); return; }
        const text = await this.cryptoSvc.decrypt(this.gmPass, this.card.gmEnc);
        this._gmText.set(text);
      }
    } catch {
      alert('Wrong passphrase.');
    }
  }

  async lockAndSave() {
    const card = { ...this.card } as LoreCard;
    // Encrypt drafts if provided
    if (this.playersDraft.trim()) {
      if (!this.playerPass) { alert('Set Player Passphrase at the top first.'); return; }
      const bundle = await this.cryptoSvc.encrypt(this.playerPass, this.playersDraft.trim());
      (bundle as EncryptedBundle)._preview = this.playersDraft.slice(0, 40) + (this.playersDraft.length > 40 ? '…' : '');
      card.playersEnc = bundle;
    } else card.playersEnc = null;

    if (this.gmDraft.trim()) {
      if (!this.gmPass) { alert('Set GM Passphrase at the top first.'); return; }
      const bundle = await this.cryptoSvc.encrypt(this.gmPass, this.gmDraft.trim());
      (bundle as EncryptedBundle)._preview = this.gmDraft.slice(0, 40) + (this.gmDraft.length > 40 ? '…' : '');
      card.gmEnc = bundle;
    } else card.gmEnc = null;

    this.update.emit(card);
  }
}
