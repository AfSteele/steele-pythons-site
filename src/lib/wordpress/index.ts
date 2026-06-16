export const WP_BASE_URL = "https://steelepythons4.wordpress.com";

type RenderedField = {
  rendered?: string;
};

type WpMedia = {
  source_url?: string;
  alt_text?: string;
};

type WpPost = {
  id: number;
  slug: string;
  link: string;
  title?: RenderedField;
  excerpt?: RenderedField;
  content?: RenderedField;
  acf?: Record<string, unknown>;
  _embedded?: {
    "wp:featuredmedia"?: WpMedia[];
  };
};

type WpCategory = {
  id: number;
};

export type AvailableClutch = {
  id: number;
  slug: string;
  title: string;
  dateLaid: string;
  summary: string;
  details: string;
  image: string;
  imageAlt: string;
  link: string;
  externalLink: string;
};

export type WordpressImage = {
  url: string;
  alt: string;
};

export type Testimonial = {
  id: number;
  name: string;
  quote: string;
  image: string;
  imageAlt: string;
  link: string;
};

const clutchCategorySlug = "available-clutches";
const testimonialCategorySlug = "testimonials";

const decodeHtml = (value = "") =>
  value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&rsquo;/g, "'")
    .replace(/&lsquo;/g, "'")
    .replace(/&rdquo;/g, '"')
    .replace(/&ldquo;/g, '"')
    .replace(/&ndash;/g, "-")
    .replace(/&mdash;/g, "-")
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, decimal) => String.fromCharCode(Number(decimal)))
    .trim();

const stripHtml = (value = "") =>
  decodeHtml(
    value
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " "),
  );

const getTagValue = (xml: string, tag: string) => {
  const match = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"));
  return decodeHtml(match?.[1] ?? "");
};

const getMediaImage = (xml: string) => {
  const thumbnail = xml.match(/<media:thumbnail[^>]+url="([^"]+)"/i)?.[1];
  const mediaContent = xml.match(/<media:content[^>]+url="([^"]+)"[^>]+medium="image"/i)?.[1];

  return decodeHtml(thumbnail || mediaContent || "");
};

const getSlugFromLink = (link: string) => {
  const cleaned = link.replace(/\/$/, "");
  return cleaned.split("/").pop() || "";
};

const getLocalClutchLink = (slug: string) => `/available/${slug}`;

const getStringField = (acf: Record<string, unknown> | undefined, keys: string[]) => {
  if (!acf) return "";

  for (const key of keys) {
    const value = acf[key];

    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return "";
};

const getDateFromText = (text: string) => {
  const match = text.match(/date\s+laid\s*:?\s*([0-9/.-]+)/i);
  return match?.[1] ?? "";
};

async function fetchWpJson<T>(path: string): Promise<T | null> {
  try {
    const response = await fetch(`${WP_BASE_URL}/wp-json/wp/v2/${path}`);

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as T;
  } catch {
    return null;
  }
}

async function fetchFeedItems(categorySlug: string, limit: number) {
  try {
    const response = await fetch(`${WP_BASE_URL}/feed/`);

    if (!response.ok) {
      return [];
    }

    const feed = await response.text();
    const items = feed.match(/<item>[\s\S]*?<\/item>/gi) ?? [];

    return items
      .filter((item) =>
        item
          .match(/<category><!\[CDATA\[([\s\S]*?)\]\]><\/category>/gi)
          ?.some((category) => category.includes(categorySlug)),
      )
      .slice(0, limit);
  } catch {
    return [];
  }
}

async function fetchAvailableClutchesFromFeed(limit: number): Promise<AvailableClutch[]> {
  try {
    const items = await fetchFeedItems(clutchCategorySlug, limit);

    return items
      .map((item) => {
        const title = stripHtml(getTagValue(item, "title")) || "Available Clutch";
        const description = stripHtml(getTagValue(item, "description"));
        const content = stripHtml(getTagValue(item, "content:encoded"));
        const image = getMediaImage(item);
        const postId = Number(getTagValue(item, "post-id")) || Math.abs(title.length + item.length);
        const externalLink = getTagValue(item, "link");
        const slug = getSlugFromLink(externalLink) || String(postId);

        return {
          id: postId,
          slug,
          title,
          dateLaid: getDateFromText(description) || getDateFromText(content),
          summary: description || content,
          details: content || description,
          image,
          imageAlt: title,
          link: getLocalClutchLink(slug),
          externalLink,
        };
      });
  } catch {
    return [];
  }
}

async function fetchTestimonialsFromFeed(limit: number): Promise<Testimonial[]> {
  try {
    let items = await fetchFeedItems(testimonialCategorySlug, limit);

    if (!items.length) {
      const response = await fetch(`${WP_BASE_URL}/feed/`);

      if (!response.ok) {
        return [];
      }

      const feed = await response.text();
      items = (feed.match(/<item>[\s\S]*?<\/item>/gi) ?? [])
        .filter((item) => !item.includes(clutchCategorySlug))
        .slice(0, limit);
    }

    return items.map((item) => {
      const title = stripHtml(getTagValue(item, "title")) || "Customer";
      const description = stripHtml(getTagValue(item, "description"));
      const content = stripHtml(getTagValue(item, "content:encoded"));
      const quote = content || description || title;
      const mediaImage = getMediaImage(item);
      const image = mediaImage.includes("gravatar.com") ? "" : mediaImage;
      const postId = Number(getTagValue(item, "post-id")) || Math.abs(title.length + item.length);

      return {
        id: postId,
        name: "Customer Testimonial",
        quote,
        image,
        imageAlt: title,
        link: getTagValue(item, "link"),
      };
    });
  } catch {
    return [];
  }
}

export async function getAvailableClutches(limit = 6): Promise<AvailableClutch[]> {
  const categories = await fetchWpJson<WpCategory[]>(
    `categories?slug=${clutchCategorySlug}`,
  );
  const categoryId = categories?.[0]?.id;

  if (!categoryId) {
    return fetchAvailableClutchesFromFeed(limit);
  }

  const posts = await fetchWpJson<WpPost[]>(
    `posts?categories=${categoryId}&_embed=wp:featuredmedia&per_page=${limit}&orderby=date&order=desc`,
  );

  if (!posts?.length) {
    return fetchAvailableClutchesFromFeed(limit);
  }

  return posts.map((post) => {
    const title = stripHtml(post.title?.rendered) || "Available Clutch";
    const excerpt = stripHtml(post.excerpt?.rendered);
    const content = stripHtml(post.content?.rendered);
    const featuredImage = post._embedded?.["wp:featuredmedia"]?.[0];
    const dateLaid =
      getStringField(post.acf, ["date_laid", "dateLaid", "clutch_date"]) ||
      getDateFromText(excerpt) ||
      getDateFromText(content);

    return {
      id: post.id,
      slug: post.slug,
      title,
      dateLaid,
      summary: excerpt || content,
      details: content || excerpt,
      image: featuredImage?.source_url || "",
      imageAlt: featuredImage?.alt_text || title,
      link: getLocalClutchLink(post.slug),
      externalLink: post.link,
    };
  });
}

export async function getAvailableClutch(slug: string): Promise<AvailableClutch | null> {
  const clutches = await getAvailableClutches(50);
  return clutches.find((clutch) => clutch.slug === slug) ?? null;
}

export async function getTestimonials(limit = 3): Promise<Testimonial[]> {
  const categories = await fetchWpJson<WpCategory[]>(
    `categories?slug=${testimonialCategorySlug}`,
  );
  const categoryId = categories?.[0]?.id;

  if (!categoryId) {
    return fetchTestimonialsFromFeed(limit);
  }

  const posts = await fetchWpJson<WpPost[]>(
    `posts?categories=${categoryId}&_embed=wp:featuredmedia&per_page=${limit}&orderby=date&order=desc`,
  );

  if (!posts?.length) {
    return fetchTestimonialsFromFeed(limit);
  }

  return posts.map((post) => {
    const title = stripHtml(post.title?.rendered) || "Customer";
    const excerpt = stripHtml(post.excerpt?.rendered);
    const content = stripHtml(post.content?.rendered);
    const featuredImage = post._embedded?.["wp:featuredmedia"]?.[0];

    return {
      id: post.id,
      name: title,
      quote: content || excerpt,
      image: featuredImage?.source_url || "",
      imageAlt: featuredImage?.alt_text || title,
      link: post.link,
    };
  });
}

export async function getWordpressImageBySlug(
  slug: string,
): Promise<WordpressImage | null> {
  const media = await fetchWpJson<WpMedia[]>(
    `media?slug=${encodeURIComponent(slug)}&per_page=1`,
  );
  const image = media?.[0];

  if (!image?.source_url) {
    return null;
  }

  return {
    url: image.source_url,
    alt: image.alt_text || slug.replace(/-/g, " "),
  };
}
