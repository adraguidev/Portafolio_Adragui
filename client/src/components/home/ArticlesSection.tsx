import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { Article } from '@shared/schema';
import { Skeleton } from '@/components/ui/skeleton';
import { useTranslation } from 'react-i18next';
import { formatDate } from '@/lib/utils';

const calculateReadTime = (content: string) => {
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  const readTime = Math.ceil(words / wordsPerMinute);
  return readTime < 1 ? 1 : readTime;
};

const ArticleCard = ({ article }: { article: Article }) => {
  const { t, i18n } = useTranslation();
  const readTime = calculateReadTime(article.content);

  return (
    <motion.article
      className="bg-white rounded-xl shadow-sm overflow-hidden group hover:shadow-md transition-shadow"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
    >
      {article.imageUrl && (
        <div className="aspect-video overflow-hidden">
          <img
            src={article.imageUrl}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}
      <div className="p-6">
        <div className="flex items-center text-sm text-text/60 mb-3">
          <span>
            {article.publishedAt
              ? formatDate(article.publishedAt, i18n.language)
              : article.published
              ? formatDate(article.updatedAt, i18n.language)
              : t('common.draft', 'Borrador')}
          </span>
          <span className="mx-2">•</span>
          <span>
            {readTime} {t('common.readTime', 'min de lectura')}
          </span>
        </div>
        <Link href={`/articles/${article.slug}`}>
          <h3 className="font-clash font-semibold text-xl mb-3 group-hover:text-secondary transition-colors">
            {article.title}
          </h3>
        </Link>
        <p className="text-text/70 text-sm mb-4">{article.summary}</p>
        <Link
          href={`/articles/${article.slug}`}
          className="inline-flex items-center text-secondary font-medium text-sm hover:text-secondary/80 transition-colors"
        >
          {t('common.readArticle', 'Leer Artículo')}
          <i className="ri-arrow-right-line ml-1"></i>
        </Link>
      </div>
    </motion.article>
  );
};

const ArticleSkeleton = () => (
  <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-slate-100">
    <div className="aspect-[16/10] relative overflow-hidden">
      <Skeleton className="w-full h-full" />
      <div className="absolute top-4 left-4">
        <Skeleton className="w-20 h-6 rounded-full" />
      </div>
    </div>
    <div className="p-6">
      <div className="flex items-center mb-3">
        <Skeleton className="w-24 h-4 mr-2" />
        <Skeleton className="w-2 h-4 mx-2" />
        <Skeleton className="w-16 h-4" />
      </div>
      <Skeleton className="w-full h-7 mb-3" />
      <Skeleton className="w-full h-4 mb-1" />
      <Skeleton className="w-5/6 h-4 mb-4" />
      <Skeleton className="w-32 h-4" />
    </div>
  </div>
);

const ArticlesSection = () => {
  const { t } = useTranslation();
  const { data: articles, isLoading } = useQuery<Article[]>({
    queryKey: ['/api/articles'],
  });

  // Filter only published articles and limit to 3
  const publishedArticles = articles
    ?.filter((article) => article.published)
    .slice(0, 3);

  return (
    <section id="articles" className="py-20 bg-slate-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <motion.h2
            className="font-clash font-bold text-4xl md:text-5xl text-primary mb-4"
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            {t('home.title')}
          </motion.h2>
          <motion.p
            className="text-text/70 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
          >
            {t(
              'home.articlesDescription',
              'Pensamientos, ideas y descubrimientos de mi trayectoria en el desarrollo web.'
            )}
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {isLoading ? (
            <>
              <ArticleSkeleton />
              <ArticleSkeleton />
              <ArticleSkeleton />
            </>
          ) : (
            publishedArticles?.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))
          )}
        </div>

        <div className="mt-12 text-center">
          <Link href="/articles">
            <motion.div
              className="inline-flex items-center border-b-2 border-secondary/70 text-secondary font-medium hover:border-secondary transition-colors cursor-pointer"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              viewport={{ once: true }}
            >
              {t('home.viewAllArticles', 'Ver Todos los Artículos')}
              <i className="ri-arrow-right-line ml-2"></i>
            </motion.div>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ArticlesSection;
