import React from 'react';
import { Link } from 'react-router-dom';
import { Utensils, ArrowRight } from 'lucide-react';

const EmptyState = ({
  icon: Icon = Utensils,
  title = 'No items found',
  description = 'There are no records to display at this moment.',
  actionText,
  actionLink,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-white rounded-3xl border border-cream-200 p-8 shadow-sm my-6 max-w-lg mx-auto">
      <div className="w-16 h-16 rounded-3xl bg-cream-100 flex items-center justify-center text-forest-800 mb-4 shadow-inner">
        <Icon className="w-8 h-8 text-forest-700" />
      </div>
      <h3 className="text-xl font-bold text-slate-900 font-serif mb-2">{title}</h3>
      <p className="text-sm text-slate-500 max-w-sm mb-6 leading-relaxed">{description}</p>

      {actionText && actionLink && (
        <Link
          to={actionLink}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-forest-900 text-white font-semibold text-sm hover:bg-forest-800 transition-colors shadow-md shadow-forest-900/10"
        >
          <span>{actionText}</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      )}

      {actionText && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-forest-900 text-white font-semibold text-sm hover:bg-forest-800 transition-colors shadow-md shadow-forest-900/10"
        >
          <span>{actionText}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default EmptyState;
