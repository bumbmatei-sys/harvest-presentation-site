import React, { useState } from 'react';

// Same standalone Stripe checkout the dedicated AI Assistant section used before:
// POST the email, then redirect to the Stripe Checkout URL it returns.
const CHECKOUT_URL = 'https://theharvest.app/api/stripe/standalone-checkout';

// Mirrors AI_ASSISTANT_ADDON_PRICING in the Harvest app — the assistant is a
// standalone add-on available on any plan (and included free on Ministry).
const PRICE = '$200';

// Compact add-on card shown beneath the pricing plans. Visually distinct from the
// four plan tiers (dark card, gold accent) so it reads as an add-on, not a 5th tier.
export const AiAssistantAddonCard: React.FC = () => {
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
    <div
      className="mt-6 rounded-2xl border border-gold/40 shadow-lg p-6 md:p-8 flex flex-col md:flex-row md:items-center gap-6"
      style={{ backgroundColor: '#1e2330' }}
    >
      <div className="flex-1">
        <div className="flex flex-wrap items-center gap-3 mb-3">
          <span className="text-[10px] font-semibold tracking-[2px] uppercase text-gold bg-gold/10 border border-gold/30 px-2.5 py-1 rounded-full">
            Add-on
          </span>
          <h3 className="text-white font-serif text-2xl font-medium">AI Assistant</h3>
        </div>
        <p className="text-white/70 text-sm md:text-base leading-relaxed max-w-xl">
          Connect it to over 900+ apps to schedule, automate and superboost the productivity of
          your ministry. Add it to any plan — no subscription tier required.{' '}
          <span className="text-gold font-medium">Included free on Ministry.</span>
        </p>
      </div>

      <div className="md:w-72 md:flex-shrink-0">
        <div className="mb-4 md:text-right">
          <span className="text-gold font-serif text-3xl font-medium">{PRICE}</span>
          <span className="text-white/60 text-sm">/mo</span>
        </div>

        {!showForm ? (
          <button
            onClick={() => setShowForm(true)}
            className="w-full bg-gold text-white hover:bg-gold-light px-6 py-3 rounded-lg text-sm font-semibold transition-colors"
          >
            Add the Assistant
          </button>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              autoFocus
              className="w-full bg-warm-dark border border-gold/20 rounded-lg px-4 py-3 text-white placeholder-warm-brown text-sm focus:outline-none focus:border-gold/60"
            />
            {error && <p className="text-red-400 text-xs">{error}</p>}
            <button
              type="submit"
              disabled={loading || !email}
              className="w-full bg-gold text-white hover:bg-gold-light disabled:opacity-50 px-6 py-3 rounded-lg text-sm font-semibold transition-colors"
            >
              {loading ? 'Redirecting to checkout…' : 'Continue to checkout'}
            </button>
            <p className="text-[11px] text-white/50 text-center">
              Cancel anytime. You'll get a magic link by email to connect your Telegram bot.
            </p>
          </form>
        )}
      </div>
    </div>
  );
};

export default AiAssistantAddonCard;
