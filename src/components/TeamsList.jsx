import React from 'react';
import PropTypes from 'prop-types';
import crypto from 'crypto'; // Node built-in

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
      return `https://www.gravatar.com/avatar/${hash}?s=200&d=identicon`;
    }
    return member.data.image || '/images/default-team.png';
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
      {filtered.map(member => {
        const key = member.data.slug || member.data.title || crypto.randomUUID();
        const title = member.data.title || 'Unnamed';
        const jobTitle = member.data.jobTitle || '';
        const profileLink = showLinks && member.data.slug ? `/team/${member.data.slug}` : null;

        return (
          <div
            key={key}
            className="flex flex-col items-center text-center p-6 border border-accent-500 
                       rounded-xl bg-white dark:bg-primary-500 
                       hover:shadow-lg hover:border-accent-400 
                       transition-all duration-300"
          >
            <img
              src={getAvatar(member)}
              alt={title}
              className="w-24 h-24 rounded-full object-cover mb-4 border border-accent-500 shadow-sm"
            />
            <h3 className="text-xl font-semibold text-accent-500">{title}</h3>
            {jobTitle && <p className="text-sm text-gray-700 dark:text-white">{jobTitle}</p>}
            {profileLink && (
              <a
                href={profileLink}
                className="mt-3 inline-block text-sm font-medium text-white 
                           bg-accent-500 hover:bg-accent-600 
                           px-4 py-2 rounded-md transition-colors"
              >
                View Profile
              </a>
            )}
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