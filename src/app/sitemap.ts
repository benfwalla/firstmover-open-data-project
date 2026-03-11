import type { MetadataRoute } from 'next';
import { getPostsByType } from '@/lib/content';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.firstmovernyc.com/open';

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date() },
    { url: `${baseUrl}/open-data`, lastModified: new Date() },
    { url: `${baseUrl}/reports`, lastModified: new Date() },
    { url: `${baseUrl}/resources`, lastModified: new Date() },
    { url: `${baseUrl}/newsletter`, lastModified: new Date() },
    { url: `${baseUrl}/about`, lastModified: new Date() },
    { url: `${baseUrl}/blog`, lastModified: new Date() },
    { url: `${baseUrl}/tools/find-your-neighborhood`, lastModified: new Date() },
    { url: `${baseUrl}/tools/guess-the-rent`, lastModified: new Date() },
    { url: `${baseUrl}/tools/rent-check`, lastModified: new Date() },
  ];

  const blogPosts = getPostsByType('blog').map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.frontmatter.date),
  }));

  const reports = getPostsByType('report').map((post) => ({
    url: `${baseUrl}/reports/${post.slug}`,
    lastModified: new Date(post.frontmatter.date),
  }));

  return [...staticPages, ...blogPosts, ...reports];
}
