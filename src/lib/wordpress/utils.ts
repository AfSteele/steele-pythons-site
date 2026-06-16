import { WP_BASE_URL } from ".";

export const wpasset = (assetPath: string) =>
  `${WP_BASE_URL}/wp-content/uploads/${assetPath}`;