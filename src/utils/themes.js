// utils/themes.js
import { getCollection as astroGetCollection } from 'astro:content';

export async function getCollection(categorySlug) {
  const allThemes = await astroGetCollection('space-sustainability');
  if (!categorySlug) return allThemes;

  return allThemes.filter(theme => theme.data.category === categorySlug);
}