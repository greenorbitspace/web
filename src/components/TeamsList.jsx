import React from 'react';
import PropTypes from 'prop-types';
import crypto from 'crypto';

export default function TeamsList({ teamMembers = [], excludeSlug = '', showLinks = true }) {
  // Filter out excluded slug
  const filtered = teamMembers.filter(member => {
    const slug = member?.data?.slug;
    return slug && slug.toLowerCase() !== (excludeSlug || '').toLowerCase();
  });

  if (!filtered.length) {
    return <p className="text-white italic">No other team members found.</p>;
  }

  // Generate Gravatar or fallback image
  const getAvatar = member => {
    if (!member?.data) return '/images/default-team.png';

    if (member.data.contactEmail) {
      const hash = crypto
        .createHash('md5')
        .update(member.data.contactEmail.trim().toLowerCase())
        .digest('hex');
      return `https://www.gravatar.com/avatar/${hash}?s=300&d=identicon`;
    }

    return member.data.image || '/images/default-team.png';
  };

  return (
    <div className="space-y-8">
      {filtered.map(member => {
        const key = member.data.slug || member.data.title || crypto.randomUUID();
        const name = member.data.title || 'Unnamed';
        const jobTitle = member.data.jobTitle || '';
        const description = member.data.description || '';
        const profileLink = showLinks && member.data.slug ? `/team/${member.data.slug}` : null;

        return (
          <div
            key={key}
            className="grid grid-cols-1 md:grid-cols-[160px_1fr] gap-6 
                       p-6 border border-accent-500 rounded-xl 
                       bg-white dark:bg-primary-500 
                       hover:shadow-lg hover:border-accent-400 
                       transition-all duration-300"
          >
            {/* Image (Left) */}
            <div className="flex justify-center md:justify-start">
              <img
                src={getAvatar(member)}
                alt={name}
                className="w-32 h-32 rounded-full object-cover 
                           border border-accent-500 shadow-sm"
              />
            </div>

            {/* Text (Right) */}
            <div className="flex flex-col justify-center text-center md:text-left">
              <h3 className="text-2xl font-semibold text-accent-500">{name}</h3>

              {jobTitle && (
                <p className="text-sm text-gray-700 dark:text-white mt-1">
                  {jobTitle}
                </p>
              )}

              {description && (
                <p className="text-gray-600 dark:text-white mt-3 leading-relaxed">
                  {description}
                </p>
              )}

              {profileLink && (
                <div className="mt-4 flex justify-center md:justify-start">
                  <a
                    href={profileLink}
                    className="btn-primary inline-block"
                  >
                    View Profile
                  </a>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

TeamsList.propTypes = {
  teamMembers: PropTypes.array,
  excludeSlug: PropTypes.string,
  showLinks: PropTypes.bool,
};