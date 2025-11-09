import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { LoreArticle, EncryptedBundle, LoreSection, LoreSectionAccess } from '@app/models';
import { CryptoService } from '@app/services';

export type SectionFormGroup = FormGroup<{
  access: FormControl<LoreSectionAccess>;
  text: FormControl<string>;
  enc: FormControl<EncryptedBundle | null>;
}>;

@Component({
  selector: 'app-lore-article',
  standalone: false,
  templateUrl: './lore-article.component.html',
  styleUrls: ['./lore-article.component.scss'],
})
export class LoreArticleComponent implements OnChanges {
  @Input() article!: LoreArticle;
  @Input() editing = false;
  @Input() gmPass = '';
  @Output() update = new EventEmitter<LoreArticle>();
  @Output() remove = new EventEmitter<string>();

  form: FormGroup<{
    title: FormControl<string>,
    sections: FormArray<SectionFormGroup>
  }>;
  get sections(): FormArray<SectionFormGroup> { return this.form.controls.sections; }
  readonly LoreSectionAccess = LoreSectionAccess;

  constructor(
    private readonly cryptoService: CryptoService,
    private readonly formBuilder: FormBuilder,
  ) {
    this.form = this.formBuilder.group({
      title: this.formBuilder.control<string>('', { nonNullable: true, validators: [Validators.required] }),
      sections: this.formBuilder.array<SectionFormGroup>([]),
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['article'] && this.article) {
      this.form.patchValue({ title: this.article.title ?? '' }, { emitEvent: false });
      this.sections.clear();
      for (const s of this.article.sections) {
        if (s.access === LoreSectionAccess.PUBLIC) {
          this.sections.push(this.formBuilder.group({
            access: this.formBuilder.control<LoreSectionAccess>(LoreSectionAccess.PUBLIC, { nonNullable: true }),
            text: this.formBuilder.control<string>(s.text, { nonNullable: true }),
            enc: this.formBuilder.control<EncryptedBundle | null>(null),
          }) as SectionFormGroup);
        } else {
          this.sections.push(this.formBuilder.group({
            access: this.formBuilder.control<LoreSectionAccess>(LoreSectionAccess.PRIVATE, { nonNullable: true }),
            text: this.formBuilder.control<string>('', { nonNullable: true }),
            enc: this.formBuilder.control<EncryptedBundle | null>(s.enc),
          }) as SectionFormGroup);
        }
      }
      if (this.gmPass) this.decryptAllPrivate();
    }
    if (changes['gmPass'] && this.gmPass) this.decryptAllPrivate();
  }

  async lockAndSave() {
    const raw = this.form.getRawValue();
    const out: LoreSection[] = [];
    for (const s of raw.sections) {
      if (s.access === LoreSectionAccess.PUBLIC) {
        out.push({ access: LoreSectionAccess.PUBLIC, text: s.text || '' });
      } else {
        const text = (s.text || '').trim();
        if (!text && s.enc) { out.push({ access: LoreSectionAccess.PRIVATE, enc: s.enc }); continue; }
        if (!text) continue;
        if (!this.gmPass) { alert('Set DM Passphrase at the top first.'); return; }
        const bundle = await this.cryptoService.encrypt(this.gmPass, text);
        (bundle as EncryptedBundle)._preview = text.slice(0, 40) + (text.length > 40 ? '.' : '');
        out.push({ access: LoreSectionAccess.PRIVATE, enc: bundle });
      }
    }
    const next: LoreArticle = { id: this.article.id, title: raw.title, sections: out };
    this.update.emit(next);
  }

  addSection(access: LoreSectionAccess = LoreSectionAccess.PUBLIC) {
    this.sections.push(this.formBuilder.group({
      access: this.formBuilder.control<LoreSectionAccess>(access, { nonNullable: true }),
      text: this.formBuilder.control<string>('', { nonNullable: true }),
      enc: this.formBuilder.control<EncryptedBundle | null>(null),
    }) as SectionFormGroup);
  }

  removeSection(i: number) { this.sections.removeAt(i); }

  async decryptAllPrivate() {
    for (const grp of this.sections.controls) {
      const access = grp.controls.access.value as LoreSectionAccess;
      if (access === LoreSectionAccess.PRIVATE) {
        const enc = grp.controls.enc.value as EncryptedBundle | null;
        if (enc && this.gmPass) {
          try {
            const text = await this.cryptoService.decrypt(this.gmPass, enc);
            grp.controls.text.setValue(text, { emitEvent: false });
          } catch {}
        }
      }
    }
  }
}
