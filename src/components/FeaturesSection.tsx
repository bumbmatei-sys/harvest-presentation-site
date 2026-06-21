import React from 'react';

const features = [
  {
    title: 'AI Knowledge Base',
    desc: 'Train AI on your teachings, sermons, and study materials. Members get instant, contextual answers rooted in your ministry\'s theology — not generic ChatGPT responses.',
    span: 'lg:col-span-2',
    icon: '🔮',
  },
  {
    title: 'Personal AI Assistant',
    desc: 'A Telegram-integrated AI assistant that handles member questions, prayer requests, and follow-ups — automatically.',
    span: '',
    icon: '✨',
  },
  {
    title: 'Community Feed',
    desc: 'Posts, comments, prayer requests, events, and polls in a private space that belongs to you.',
    span: '',
    icon: '💬',
  },
  {
    title: 'Blog & Publishing',
    desc: 'Share teaching, devotionals, and announcements with a built-in rich text editor.',
    span: '',
    icon: '📝',
  },
  {
    title: 'Courses',
    desc: 'Structured learning paths with lessons, video, and progress tracking — designed for discipleship.',
    span: 'lg:col-span-2',
    icon: '🎓',
  },
  {
    title: 'Admin Dashboard',
    desc: 'Full control over your platform — members, content, branding, and analytics in one place.',
    span: '',
    icon: '⚙️',
  },
  {
    title: 'Evangelism Analytics',
    desc: 'Track engagement, growth, and impact with real data — not guesswork.',
    span: '',
    icon: '📊',
  },
  {
    title: 'Automated Newsletter',
    desc: 'AI-generated newsletters from your recent content, sent automatically to your community.',
    span: '',
    icon: '📨',
  },
];

export const FeaturesSection: React.FC = () => {
  return (
    <section id="features" className="bg-warm-dark grain-overlay py-24 md:py-36">
      <div className="max-w-[1140px] mx-auto px-6">
        <div className="text-center mb-16">
          <p className="text-gold text-xs font-semibold tracking-[3px] uppercase mb-4">
            Everything Included
          </p>
          <h2 className="text-white font-serif text-4xl md:text-5xl font-light text-balance">
            Eight tools. One platform. Zero add-ons.
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {features.map((feature, i) => (
            <div
              key={feature.title}
              className={`group border border-white/10 rounded-xl p-8 transition-all duration-300 hover:border-gold/40 ${
                feature.span
              } ${
                i === 0 || i === 4 ? 'bg-white/[0.03]' : 'bg-transparent'
              }`}
            >
              <div className="text-3xl mb-4 opacity-80">{feature.icon}</div>
              <h3 className="text-white font-serif text-xl font-medium mb-3">
                {feature.title}
              </h3>
              <p className="text-white/40 text-sm leading-relaxed">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
