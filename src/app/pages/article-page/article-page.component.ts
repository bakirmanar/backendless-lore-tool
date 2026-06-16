import { Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Article } from '@app/models';
import { StateService } from '@app/services';
import { routeParamSignal } from '@app/signals';

@Component({
  selector: 'app-article-page',
  standalone: false,
  templateUrl: './article-page.component.html',
  styleUrls: ['./article-page.component.scss']
})
export class ArticlePageComponent {
  protected readonly stateService: StateService = inject(StateService);
  private readonly router: Router = inject(Router);

  private readonly articleId = routeParamSignal<string>('id');
  protected readonly article = computed<Article | undefined>(() => {
    const articleId = this.articleId();
    const articles = this.stateService.articles();

    return articles && articleId
      ? articles.find((article) => article.id === articleId)
      : undefined;
  });

  edit() {
    if (!this.article()) return;

    this.router.navigate(['/edit', this.article()!.id]);
  }

  back() {
    // Should go back and not to main page
    this.router.navigate(['/']);
  }
}

const articleMock = {
  title: 'Test title',
  accessTags: [],
  id: 'asdasdasdasd',
  sections: [
    {
      id: `aaasdasdwqweq`,
      accessTags: [],
      content: `
# Lorem Ipsum Document

## Introduction

Lorem ipsum dolor sit amet, **consectetur adipiscing elit**. Sed do eiusmod *tempor incididunt* ut labore et dolore magna aliqua. This sentence contains ***bold and italic text***, and this one contains ~~strikethrough text~~.

> Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.

---

## Text Formatting

Here is some \`inline code\` inside a sentence.

You can also create a [link to an example website](https://example.com).

### Unordered List

- Lorem ipsum dolor sit amet
- Consectetur adipiscing elit
  - Nested item one
  - Nested item two
- Sed do eiusmod tempor incididunt

### Ordered List

1. First lorem item
2. Second ipsum item
   1. Nested ordered item
   2. Another nested item
3. Third dolor item

### Task List

- [x] Write lorem ipsum
- [x] Add markdown examples
- [ ] Review final document

---

## Code Block

\`\`\`ts
function loremIpsum(name: string): string {
  return \`Lorem ipsum, ${name}!\`;
}

console.log(loremIpsum("dolor sit amet"));
\`\`\`

---

## Table

| Feature | Example | Status |
|---|---|---|
| Bold | \`**text**\` | Done |
| Italic | \`*text*\` | Done |
| Link | \`[text](url)\` | Done |
| Code | \`\` \`code\` \`\` | Done |

---

## Image

![Lorem placeholder image](images/Screenshot_2026-03-28_234733.png){width=100 height=100}

---

## Footnote

Lorem ipsum dolor sit amet, consectetur adipiscing elit.[^1]

[^1]: This is a sample footnote with lorem ipsum content.

---

## Collapsible Section

<details>
<summary>Click to expand lorem ipsum</summary>

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero. Sed cursus ante dapibus diam.

</details>

---

## Final Notes

> **Note:** Lorem ipsum dolor sit amet, consectetur adipiscing elit.

Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem.
          `
    }
  ]
}
