import React from 'react';

const jobs = [
  {
    id: 'senior-frontend-developer',
    title: 'Senior Frontend Developer',
    location: 'Remote',
    employment_type: 'Full-time',
    department: 'Engineering',
    seniority_level: 'Senior',
    description:
      "We're looking for an experienced frontend developer to help us build beautiful, responsive, and accessible user interfaces for our SaaS platform. Join a passionate team driving innovation and shaping the future of sustainable tech.",
    responsibilities: [
      'Develop and maintain scalable frontend applications using React and TypeScript',
      'Collaborate closely with design and backend teams to deliver seamless user experiences',
      'Optimize applications for maximum speed and scalability',
      'Ensure the technical feasibility of UI/UX designs',
      'Participate in code reviews and contribute to team knowledge sharing',
    ],
    requirements: [
      '5+ years of professional frontend development experience',
      'Expertise in React, TypeScript, and Tailwind CSS',
      'Strong understanding of web accessibility standards and best practices',
      'Experience with responsive and adaptive design',
      'Excellent problem-solving skills and attention to detail',
    ],
    benefits: [
      'Flexible working hours and fully remote-friendly environment',
      'Competitive salary and performance bonuses',
      'Professional development budget and conference attendance',
      'Collaborative and inclusive company culture',
      'Opportunity to work on cutting-edge sustainable tech projects',
    ],
    skills: ['React', 'TypeScript', 'Tailwind CSS', 'Remote', 'Frontend'],
    apply_url: 'https://yourcompany.com/careers/senior-frontend-developer',
    contact_email: 'hr@yourcompany.com',
  },
  // Add more jobs here as needed
];

export default function Careers() {
  return (
    <main className="max-w-7xl mx-auto p-6">
      <h1 className="text-5xl font-bold text-accent-500 mb-12">Careers at Green Orbit Digital</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {jobs.map((job) => (
          <div key={job.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm hover:shadow-lg transition">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2 md:mb-0">{job.title}</h2>
              <span className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-accent-500 text-green-800 dark:bg-accent-500 dark:text-white">
                {job.location}
              </span>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-4">{job.description}</p>

            <div className="mb-4">
              <strong>Employment Type:</strong> {job.employment_type}<br />
              <strong>Department:</strong> {job.department}<br />
              <strong>Seniority Level:</strong> {job.seniority_level}
            </div>

            <div className="mb-4">
              <h3 className="font-semibold mb-1">Responsibilities:</h3>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300">
                {job.responsibilities.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="mb-4">
              <h3 className="font-semibold mb-1">Requirements:</h3>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300">
                {job.requirements.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="mb-4">
              <h3 className="font-semibold mb-1">Benefits:</h3>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300">
                {job.benefits.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="mb-6">
              <h3 className="font-semibold mb-2">Skills & Keywords:</h3>
              <div className="flex flex-wrap gap-2">
                {job.skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="inline-block bg-secondary-500 text-gray-800 dark:bg-secondary-700 dark:text-white px-3 py-1 rounded text-sm font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <a
              href={job.apply_url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary inline-block px-6 py-3 rounded bg-accent-500 text-white font-semibold hover:bg-accent-700 transition"
              aria-label={`Apply for the ${job.title} role`}
            >
              Apply Now
            </a>
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              Or email your CV and portfolio to{' '}
              <a href={`mailto:${job.contact_email}`} className="text-accent-500 underline">
                {job.contact_email}
              </a>
            </p>
          </div>
        ))}
      </div>
    </main>
  );
}