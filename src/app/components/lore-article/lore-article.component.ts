import { Component, effect, inject, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Article } from '@app/models';
import { BundleCryptoService } from '@app/services';


@Component({
  selector: 'app-lore-article',
  standalone: false,
  templateUrl: './lore-article.component.html',
  styleUrls: ['./lore-article.component.scss'],
})
export class LoreArticleComponent implements OnChanges {
  private readonly bundleCryptoService: BundleCryptoService = inject(BundleCryptoService);

  @Input() article!: Article;

  constructor() {


    effect(() => {

    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['article'] && this.article) {
      // if (this.hasKey()) this.decryptAllPrivate();
    }
  }

  //@ts-ignore
  async lockAndSave() {
    //
    // if (this.article.accessTags === ContentAccess.PRIVATE) {
    //   delete this.article.enc;
    //   const str = JSON.stringify(this.article);
    //   const bundle = await this.cryptoService.encrypt('', str);
    //
    //   return {
    //     id: this.article.id,
    //     access: ContentAccess.PRIVATE,
    //     enc: bundle
    //   }
    // }
    //
    // const out: ArticleSection[] = [];
    // for (const section of this.article.sections!) {
    //   if (section.accessTags === ContentAccess.PUBLIC) {
    //     out.push({ accessTags: ContentAccess.PUBLIC, text: section.text || '' });
    //     continue;
    //   }
    //
    //   if (section.enc) {
    //     out.push({ accessTags: ContentAccess.PRIVATE, enc: section.enc });
    //     continue;
    //   }
    //
    //   if (!this.hasKey()) {
    //     alert('Set DM Passphrase in the header first.');
    //     return;
    //   }
    //
    //   const str = JSON.stringify(section);
    //   const bundle = await this.cryptoService.encrypt('', str);
    //   out.push({ accessTags: ContentAccess.PRIVATE, enc: bundle });
    // }
    //
    // this.article.sections = out;
  }

  // async decryptAllPrivate() {
  //   for (const section of this.article.sections!) {
  //     if (section.accessTags === ContentAccess.PRIVATE && !section.decrypted && section.enc && this.hasKey() && !section.text) {
  //       try {
  //         section.decrypted = true;
  //         section.text = await this.cryptoService.decrypt('', section.enc);
  //       } catch {}
  //     }
  //   }
  // }
}
