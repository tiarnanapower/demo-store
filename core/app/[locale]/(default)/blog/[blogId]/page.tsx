import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getFormatter, getTranslations } from 'next-intl/server';

import { Breadcrumb } from '@/vibes/soul/primitives/breadcrumbs';
import { BlogPostContent, BlogPostContentBlogPost } from '@/vibes/soul/sections/blog-post-content';

import { getBlogPageData } from './page-data';

import { Slot } from "@makeswift/runtime/next";
import { getSiteVersion } from "@makeswift/runtime/next/server";
import { client } from "~/lib/makeswift/client";

import { Page as MakeswiftPage } from '~/lib/makeswift';

interface Props {
  params: Promise<{ blogId: string, locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { blogId } = await params;
  const blog = await getBlogPageData({ entityId: Number(blogId) });
  const blogPost = blog?.post;

  if (!blogPost) {
    return {};
  }

  const { pageTitle, metaDescription, metaKeywords } = blogPost.seo;

  return {
    title: pageTitle || blogPost.name,
    description: metaDescription,
    keywords: metaKeywords ? metaKeywords.split(',') : null,
  };
}

async function getBlogPost(entityId: number): Promise<BlogPostContentBlogPost> {
  const format = await getFormatter();
  const blog = await getBlogPageData({ entityId });
  const blogPost = blog?.post;

  if (!blog || !blogPost) {
    return notFound();
  }

  return {
    author: blogPost.author ?? undefined,
    title: blogPost.name,
    content: blogPost.htmlBody,
    date: format.dateTime(new Date(blogPost.publishedDate.utc)),
    image: blogPost.thumbnailImage
      ? { alt: blogPost.thumbnailImage.altText, src: blogPost.thumbnailImage.url }
      : undefined,
    tags: blogPost.tags.map((tag) => ({
      label: tag,
      link: {
        href: `${blog.path}?tag=${tag}`,
      },
    })),
  };
}

async function getBlogPostBreadcrumbs(entityId: number): Promise<Breadcrumb[]> {
  const blog = await getBlogPageData({ entityId });
  const blogPost = blog?.post;
  const t = await getTranslations('Blog');

  if (!blog || !blogPost) {
    return notFound();
  }

  return [
    {
      label: t('home'),
      href: '/',
    },
    {
      label: blog.name,
      href: blog.path,
    },
    {
      label: blogPost.name,
      href: '#',
    },
  ];
}

export default async function Blog({ params }: Props) {
  const { blogId } = await params;
  const { locale } = await params;

  const contentSnapshotTop = await client.getComponentSnapshot(
    `blog-${blogId}-top-content`,
    { 
      siteVersion: await getSiteVersion(),
      locale
    }
  );

  const contentSnapshotBottom = await client.getComponentSnapshot(
    `blog-${blogId}-bottom-content`,
    {
      siteVersion: await getSiteVersion(),
      locale
    }
  );

  return (
    <>
      {/* Temporary workaround to load Makeswift theme */}
      <div className="hidden">
        <MakeswiftPage locale={locale} path="/empty" />
      </div>
      {/* End of temporary workaround to load Makeswift theme */}

      <Slot snapshot={contentSnapshotTop} label={`Blog Post #${blogId} Top Content`} />

      <BlogPostContent
        blogPost={getBlogPost(Number(blogId))}
        breadcrumbs={getBlogPostBreadcrumbs(Number(blogId))}
      />

      <Slot snapshot={contentSnapshotBottom} label={`Blog Post #${blogId} Bottom Content`} />
    </>
  );
}
