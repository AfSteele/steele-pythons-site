# Steele Pythons Site

Astro site for Steele Pythons with WordPress used as the content source for available clutches.

## WordPress Clutch Entry

The available clutch cards are pulled from WordPress posts in the `available-clutches` category.

For each clutch record:

1. In WordPress, create a new Post.
2. Set the post title to the clutch ID, for example `Clutch ID: 2026 #6`.
3. Add the category `available-clutches`.
4. Set the Featured Image to the clutch photo. This is the image shown on the homepage and availability page.
5. Add the date laid in the excerpt using this format: `Date Laid: 6/4/2026`.
6. Add full details, hatch updates, genetics, and additional notes in the post body.
7. Publish the post.

The homepage shows the latest three clutch posts. The `/available` page shows the latest twenty-four.

## WordPress Homepage Images

Upload these images to WordPress Media with these filenames or slugs:

- `home-hero-python`
- `contact-python`
- `placeholder-clutch`

The clutch cards use each post's Featured Image. The `placeholder-clutch` image is only used if a clutch post is missing a Featured Image.

## Commands

```sh
pnpm install
pnpm dev
pnpm build
```
