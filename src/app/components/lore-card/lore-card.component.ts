import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LoreCard, EncryptedBundle } from '../../models';
import { CryptoService } from '../../services';

@Component({
  selector: 'app-lore-card',
  standalone: false,
  templateUrl: './lore-card.component.html',
  styleUrl: './lore-card.component.scss',
})
export class LoreCardComponent implements OnChanges {
  @Input() card!: LoreCard;
  @Input() editing = false;
  @Input() playerPass = '';
  @Input() gmPass = '';
  @Output() update = new EventEmitter<LoreCard>();
  @Output() remove = new EventEmitter<string>();

  form: FormGroup;

  private _playersText = signal<string | null>(null);
  private _gmText = signal<string | null>(null);

  constructor(
    private readonly cryptoSvc: CryptoService,
    private readonly fb: FormBuilder,
  ) {
    this.form = this.fb.group({
      title: this.fb.control<string>('', { nonNullable: true, validators: [Validators.required] }),
      publicText: this.fb.control<string>('', { nonNullable: true }),
      playersDraft: this.fb.control<string>('', { nonNullable: true }),
      gmDraft: this.fb.control<string>('', { nonNullable: true }),
    });
  }

  playersRevealed = () => this._playersText() !== null;
  gmRevealed = () => this._gmText() !== null;
  playersText = () => this._playersText();
  gmText = () => this._gmText();

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['card'] && this.card) {
      this.form.patchValue({
        title: this.card.title ?? '',
        publicText: this.card.publicText ?? '',
        playersDraft: '',
        gmDraft: '',
      }, { emitEvent: false });
    }
  }

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
    const { title, publicText, playersDraft, gmDraft } = this.form.getRawValue() as { title: string; publicText: string; playersDraft: string; gmDraft: string; };
    const card = { ...this.card, title, publicText } as LoreCard;
    // Encrypt drafts if provided
    if (playersDraft.trim()) {
      if (!this.playerPass) { alert('Set Player Passphrase at the top first.'); return; }
      const bundle = await this.cryptoSvc.encrypt(this.playerPass, playersDraft.trim());
      (bundle as EncryptedBundle)._preview = playersDraft.slice(0, 40) + (playersDraft.length > 40 ? '�?�' : '');
      card.playersEnc = bundle;
    } else card.playersEnc = null;

    if (gmDraft.trim()) {
      if (!this.gmPass) { alert('Set GM Passphrase at the top first.'); return; }
      const bundle = await this.cryptoSvc.encrypt(this.gmPass, gmDraft.trim());
      (bundle as EncryptedBundle)._preview = gmDraft.slice(0, 40) + (gmDraft.length > 40 ? '�?�' : '');
      card.gmEnc = bundle;
    } else card.gmEnc = null;

    this.update.emit(card);
  }
}

