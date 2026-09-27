import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { adjacentDocs } from './nav';

export function DocsPager({ slug }: { slug: string }) {
  const { prev, next } = adjacentDocs(slug);
  if (!prev && !next) return null;

  return (
    <nav className="dx-pager" aria-label="Pagination">
      {prev ? (
        <Link className="dx-pager__link" to={`/docs/${prev.slug}`}>
          <span className="dx-pager__dir">
            <ArrowLeft size={14} />
            Previous
          </span>
          <span className="dx-pager__title">{prev.title}</span>
        </Link>
      ) : (
        <span />
      )}
      {next ? (
        <Link className="dx-pager__link dx-pager__link--next" to={`/docs/${next.slug}`}>
          <span className="dx-pager__dir">
            Next
            <ArrowRight size={14} />
          </span>
          <span className="dx-pager__title">{next.title}</span>
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}
