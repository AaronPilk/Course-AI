---
module: 3
position: 4
title: "Images, alt text, and visual search"
objective: "Place, name, and describe images so they help both human visitors and Google's image search."
estimated_minutes: 11
videos:
  - title: "Image SEO Best Practices — Google Search Central"
    url: "https://developers.google.com/search/docs/appearance/google-images"
    source: "Google Search Central"
---

# Images, alt text, and visual search

## The puzzle

You've put real work into your article. Photos, diagrams, screenshots. They're sharp. They're relevant.

Then you check Google Images. None of your images appear for the query you'd expect. The traffic you should be getting from image search goes to a competitor whose images are *worse* than yours.

What did they do that you didn't? Probably nothing fancy. They named their image files descriptively, wrote real alt text, and put the images next to text that explained what they show. You probably named yours `IMG_4729.jpg`.

This lesson is about the small, mostly mechanical decisions that determine whether your images surface in search.

## The simple version

Three things matter for images:

1. **Where you put them.** Images near relevant text. The text gives Google (and screen readers) context.
2. **What you name them.** Filenames and surrounding HTML matter more than people expect.
3. **What you describe them as.** Alt text is the most important attribute on the `<img>` tag.

That's basically it. Five extra minutes per image, multiplied across your site, compounds dramatically.

## The technical version

### Where to place images

Google's image search relies heavily on **context**. The text near an image tells Google what the image is about.

From Google's SEO Starter Guide:

> "Place [images] near text that's relevant to the image."

A high-quality image of blue shoes embedded in a page about Italian cuisine is going to underperform a mediocre image of blue shoes embedded in a page about footwear.

Practical placement guidance:

- **Embed images inside the section that discusses what they show.** Not all-at-the-top, all-at-the-bottom, or in a separate gallery section disconnected from the prose.
- **Use captions when they add useful context.** Captions are read by both users and Google. Brief, descriptive captions help.
- **Don't put the most important image in a background CSS image.** Background images aren't crawled the same way `<img>` elements are. If an image matters for context, use an `<img>` tag.

### Filenames

The filename of your image is a tiny but real signal. Compare:

- `IMG_4729.jpg` ← no information
- `blue-leather-shoes-side-view.jpg` ← clear, descriptive

Filenames don't need to be long, but they should describe what the image is. Lowercase, hyphens between words, no spaces. Consider this the URL of the image — same rules as page URL slugs.

When you upload to a CMS, *rename the file before uploading*. Once it's stored as `IMG_4729.jpg`, fixing it requires editing every reference.

### Alt text — the most important attribute

The `alt` attribute is text that describes what the image shows. It's used by:

- **Screen readers** for blind and low-vision users
- **Google Image Search** to understand the image
- **AI Overviews** to describe images they reference
- **Browsers** as a fallback when the image fails to load

From Google's image SEO doc:

> "Alt text is a short, but descriptive piece of text that explains the relationship between the image and your content."

What makes good alt text:

- **Descriptive.** Say what the image shows.
- **Concise.** Aim for under 125 characters; under 80 is even better.
- **Contextual.** Reflect what the image means *in the context of the page*. A photo of a person on a portrait photographer's site might be alt-texted "Sarah Chen, founder"; the same photo on a stock-photo site might be "Smiling woman in red sweater, indoor portrait."
- **No keyword stuffing.** "Blue shoes blue leather shoes best blue shoes 2026 buy blue shoes" is exactly what *not* to do.
- **Not "image of."** Screen readers already announce that it's an image. "Image of a smiling woman" reads as "image of an image of a smiling woman." Just say "a smiling woman."

What to do for **purely decorative** images (icons, dividers, generic stock):

- Use empty alt text: `alt=""`. This tells screen readers to skip the image.
- *Don't* leave alt out entirely — that causes some screen readers to read the filename, which is usually worse than nothing.

### Image size, format, and performance

A few practical guidelines:

- **Choose the right format.** WebP for most photographs (good compression). PNG for screenshots with text/UI. SVG for logos and icons. JPEG for older browsers if needed.
- **Compress before uploading.** A 5MB hero image on a blog post is bad UX and a Core Web Vitals problem.
- **Use responsive images.** `<img srcset>` lets browsers choose the right size for the device. Smaller images on mobile = faster loads.
- **Lazy-load below-the-fold images.** Use `loading="lazy"`. The first image on the page (often the hero) should be eager-loaded.

### Image structured data

For specific types of images, structured data helps Google understand them better:

- **Product images:** Add Product structured data with image URLs.
- **Recipe images:** Add Recipe structured data.
- **Article hero images:** Add Article structured data with the `image` property.

This isn't required for image search to work — but it makes your images eligible for richer treatment (carousels, hover previews, etc.).

### Image licensing metadata

If you own the rights to your images, you can add `IPTC Photo Metadata` declaring licensing terms. Google's image results can surface licensing info, which helps both protect your work and signal authority.

For AI-generated images specifically, Google Merchant Center policy requires the `IPTC DigitalSourceType` field set to `TrainedAlgorithmicMedia`. This applies to product images on shopping sites; broader use is good practice.

## An analogy: the photo caption in a newspaper

Pick up a newspaper. Every photo has a caption beneath it. The caption tells you who or what is shown, where, when, and why it matters. Without that caption, the photo is decoration. With it, the photo is *information*.

Alt text is the caption that exists in the HTML even when no caption is visible. It tells Google's image search, screen readers, and AI summarizers what the image *means*. A photo without alt text is a photo without a caption — it's pretty, but it's not searchable.

Surrounding paragraph text is the article that the photo is illustrating. Even if the caption is short, the surrounding article tells the reader what story the photo is part of.

A good photo + a useful caption + the right article around it = photo journalism. The web version is the same.

## Three real-world scenarios

**Scenario 1: The recipe blog that won image search.**
A small recipe blog renamed every image (~3,000 photos) from `IMG_*.jpg` to descriptive names like `sourdough-bread-crumb-shot.jpg`. They wrote real alt text for each. Within 4 months, traffic from Google Images doubled. The blog's text content was unchanged.

**Scenario 2: The "decorative" images that hurt accessibility.**
A site had hundreds of decorative geometric pattern images, each with alt text like "Decorative pattern image SEO marketing growth." Screen readers spent minutes per page narrating these. Real users complained. The fix: change all to `alt=""` for purely decorative images. Reserve real alt text for images with real meaning.

**Scenario 3: The 5MB hero image.**
A blog post led with a 5MB hero photo. Mobile users on slow networks bounced before the page loaded. Core Web Vitals tanked. The fix: compress to 200KB, add `srcset` for responsive sizes, eager-load the hero, lazy-load everything else. Page load dropped from 4.8s to 1.3s on mobile. CTR from search results improved.

## Common mistakes to avoid

- **Filenames like `IMG_4729.jpg`.** Free signal you're throwing away.
- **No alt text at all.** Bad for accessibility, bad for image search.
- **Keyword-stuffed alt text.** Doesn't help SEO, hurts users.
- **Putting "image of" or "photo of" at the start of alt text.** Redundant.
- **Decorative images with meaningful alt text.** Annoys screen reader users without helping anyone.
- **Background CSS images for content-relevant pictures.** Use `<img>` if it matters for context.
- **Uncompressed hero images.** Tanks page speed and Core Web Vitals.

## Read more

- [Image SEO Best Practices](https://developers.google.com/search/docs/appearance/google-images) — Google's primary image SEO doc
- [Image metadata in Google Images](https://developers.google.com/search/docs/appearance/structured-data/image-license-metadata) — licensing metadata

## Summary

- Place images inside the section of text that discusses what they show.
- Rename files descriptively *before* uploading (`blue-leather-shoes-side.jpg`, not `IMG_4729.jpg`).
- Write real alt text: descriptive, concise, context-aware, not stuffed with keywords.
- Use `alt=""` (empty) for purely decorative images so screen readers skip them.
- Compress images. Use modern formats (WebP, AVIF) when possible. Lazy-load below the fold.
- For product, recipe, or article images, add structured data so Google can treat them as more than just pictures.

Next: the long, satisfying list of technical SEO myths Google itself says you can ignore.
