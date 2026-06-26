import React, { useState } from 'react';

const CHECKOUT_URL = 'https://theharvest.app/api/stripe/standalone-checkout';

const features = [
  {
    title: 'Always on',
    desc: 'Available 24/7 — responds in seconds, never too busy for your ministry needs.',
  },
  {
    title: 'Lives on Telegram',
    desc: 'No new app to learn. Connect once via Telegram and message it like a trusted colleague.',
  },
  {
    title: 'Ministry-focused',
    desc: 'Trained for sermon prep, member care, event planning, and navigating Harvest features.',
  },
];

export const AiAssistantProductCard: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError('');
    try {
      const resp = await fetch(CHECKOUT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await resp.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || 'Something went wrong. Please try again.');
        setLoading(false);
      }
    } catch {
      setError('Could not connect. Please try again.');
      setLoading(false);
    }
  };

  return (
    <section id="ai-assistant" className="bg-warm-dark grain-overlay py-24 md:py-36">
      <div className="max-w-[1140px] mx-auto px-6">
        <div className="text-center mb-14">
          <p className="text-gold text-xs font-semibold tracking-[3px] uppercase mb-4">
            AI Assistant
          </p>
          <h2 className="text-white font-serif text-4xl md:text-5xl font-light text-balance mb-4">
            Your personal <span className="text-gold">ministry assistant</span>
          </h2>
          <p className="text-warm-brown text-lg max-w-xl mx-auto">
            A dedicated AI on Telegram that knows your ministry, your members, and your calendar — ready whenever you are.
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="rounded-3xl border border-gold/20 bg-earth p-8 md:p-12">
            <div className="flex items-baseline gap-2 mb-8">
              <span className="text-5xl font-bold text-gold">$200</span>
              <span className="text-warm-brown text-lg">/month</span>
              <span className="ml-2 text-xs text-warm-brown bg-gold/10 border border-gold/20 px-2 py-0.5 rounded-full">
                per admin
              </span>
            </div>

            <div className="space-y-5 mb-10">
              {features.map(f => (
                <div key={f.title} className="flex gap-4">
                  <div className="mt-1 w-5 h-5 flex-shrink-0 rounded-full bg-gold/20 flex items-center justify-center">
                    <svg className="w-3 h-3 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">{f.title}</p>
                    <p className="text-warm-brown text-sm mt-0.5">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {!showForm ? (
              <button
                onClick={() => setShowForm(true)}
                className="w-full py-4 bg-gold hover:bg-gold-light text-white font-semibold rounded-2xl transition-colors text-base"
              >
                Get AI Assistant — $200/mo
              </button>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="w-full bg-warm-dark border border-gold/20 rounded-xl px-4 py-3 text-white placeholder-warm-brown text-sm focus:outline-none focus:border-gold/60"
                />
                {error && <p className="text-red-400 text-xs">{error}</p>}
                <button
                  type="submit"
                  disabled={loading || !email}
                  className="w-full py-4 bg-gold hover:bg-gold-light disabled:opacity-50 text-white font-semibold rounded-2xl transition-colors text-base"
                >
                  {loading ? 'Redirecting to checkout...' : 'Subscribe — $200/mo'}
                </button>
                <p className="text-xs text-warm-brown text-center">
                  Cancel anytime. You'll receive a magic link by email to connect your Telegram bot.
                </p>
              </form>
            )}
          </div>

          <p className="text-center text-warm-brown text-sm mt-6">
            Already a Harvest subscriber?{' '}
            <a href="https://theharvest.app" className="text-gold hover:text-gold-light underline underline-offset-2">
              Add AI Assistant from your admin settings
            </a>
          </p>
        </div>
      </div>
    </section>
  );
};
