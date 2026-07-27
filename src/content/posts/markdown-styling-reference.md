---
title: Markdown styling reference
category: inside-harvest
status: draft
publish_date: 2026-07-27
updated: 2026-07-27
description: A draft post that exercises every markdown element the blog styles, so layout regressions show up here before they reach a real article.
reading_time: 3 min
cover: /blog/markdown-styling-reference/cover.webp
cover_alt: A gold gradient placeholder standing in for a post cover image
---

This post exists to exercise the styling, not to say anything. It stays on
`status: draft`, so it produces no page, no listing entry and no sitemap row —
flip it to `published` locally when you want to look at the rendering.

## A second-level heading

Body copy sits at 17.5px on a 1.75 line height, capped at a 68-character
measure. Long enough to read comfortably, short enough that the eye finds the
start of the next line without hunting for it.

### A third-level heading

Inline elements: a [link back to the index](/blog), some `inline code`, and
**bold** next to *italic*.

- An unordered list item
- A second item, long enough to wrap onto a second line so the hanging indent
  and the gold marker can be checked together
- A third item

1. An ordered list item
2. A second one
3. A third one

> A blockquote takes a gold left rule and sets in the serif face, so a pulled
> quotation reads as a change of voice rather than just indented body copy.

![A blue gradient placeholder standing in for a body image](/blog/markdown-styling-reference/diagram.webp "Body images take a caption from the markdown title attribute")

## A table

| Element | Treatment | Notes |
| --- | --- | --- |
| Blockquote | Gold left rule, serif | Scoped to `.blog-body` |
| Inline code | Stone background | Hairline border |
| Table | Hairline borders | Scrolls inside its own box on narrow screens |
| Image | Card radius, stone border | `width`/`height` from the real file |

A fenced block, which should scroll rather than push the page sideways:

```ts
export function slugFromPath(path: string): string {
  return path.split('/').pop()!.replace(/\.md$/, '');
}
```

---

A horizontal rule sits above this line, and this paragraph closes the post.
