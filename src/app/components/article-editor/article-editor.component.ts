import { Component, computed, effect, inject, input, output, ViewEncapsulation } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { Article, ArticleSection, ArticleType, ContentAccessTagId } from '@app/models';
import { StateService } from '@app/services';

type ArticleSectionForm = FormGroup<{
  id: FormControl<string>;
  accessTags: FormControl<ContentAccessTagId[]>;
  content: FormControl<string>;
}>;

type ArticleForm = FormGroup<{
  id: FormControl<string>;
  title: FormControl<string>;
  type: FormControl<ArticleType | null>;
  accessTags: FormControl<ContentAccessTagId[]>;
  sections: FormArray<ArticleSectionForm>;
}>;

@Component({
  selector: 'app-article-editor',
  standalone: false,
  templateUrl: './article-editor.component.html',
  styleUrls: ['./article-editor.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ArticleEditorComponent {
  private readonly stateService: StateService = inject(StateService);

  public readonly articleChange = output<Article>();

  // readonly article = input<Article | null>({ accessTags: [], sections: []} as unknown as Article);
  protected readonly article = input<Article | null>(this.stateService.articles()[2]!);
  protected readonly accessTags = computed(() => this.stateService.state.ownerData?.accessTags ?? []);

  protected readonly articleTypes: ArticleType[] = Object.values(ArticleType);
  protected readonly articleForm: ArticleForm = new FormGroup({
    id: new FormControl('', { nonNullable: true }),
    title: new FormControl('', { nonNullable: true }),
    type: new FormControl<ArticleType | null>(null),
    accessTags: new FormControl<ContentAccessTagId[]>([], { nonNullable: true }),
    sections: new FormArray<ArticleSectionForm>([]),
  });

  constructor() {
    effect(() => {
      this.resetForm(this.article());
    });

    this.articleForm.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => {
      const article = this.buildArticleFromForm();

      if (article) {
        this.articleChange.emit(article);
      }
    });
  }

  protected get sections(): FormArray<ArticleSectionForm> {
    return this.articleForm.controls.sections;
  }

  protected addSection(): void {
    if (!this.article()) {
      return;
    }

    this.sections.push(
      this.createSectionForm({
        id: crypto.randomUUID(),
        accessTags: [],
        content: '',
      })
    );
  }

  protected removeSection(index: number): void {
    if (!this.article()) {
      return;
    }

    this.sections.removeAt(index);
  }

  private resetForm(article: Article | null): void {
    this.sections.clear({ emitEvent: false });

    if (!article) {
      this.articleForm.reset(
        {
          id: '',
          title: '',
          type: null,
          accessTags: [],
          sections: [],
        },
        { emitEvent: false }
      );

      return;
    }

    for (const section of article.sections) {
      this.sections.push(this.createSectionForm(section), { emitEvent: false });
    }

    this.articleForm.reset(
      {
        id: article.id,
        title: article.title,
        type: article.type ?? null,
        accessTags: [...article.accessTags],
        sections: article.sections.map((section) => ({
          id: section.id,
          accessTags: [...section.accessTags],
          content: section.content,
        })),
      },
      { emitEvent: false }
    );
  }

  private createSectionForm(section: ArticleSection): ArticleSectionForm {
    return new FormGroup({
      id: new FormControl(section.id, { nonNullable: true }),
      accessTags: new FormControl<ContentAccessTagId[]>([...section.accessTags], {
        nonNullable: true,
      }),
      content: new FormControl(section.content, { nonNullable: true }),
    });
  }

  private buildArticleFromForm(): Article | null {
    if (!this.article()) {
      return null;
    }

    const value = this.articleForm.getRawValue();

    return {
      id: value.id,
      title: value.title,
      type: value.type ?? undefined,
      accessTags: [...value.accessTags],
      sections: value.sections.map((section) => ({
        id: section.id,
        accessTags: [...section.accessTags],
        content: section.content,
      })),
    };
  }
}
