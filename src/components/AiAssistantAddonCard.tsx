import React from 'react';

// Standalone AI Assistant add-on checkout. Links straight to a Stripe Payment
// Link for the active $200/mo price (price_1TmgRP1YKkcSbTf33wjxEsdr) so checkout
// is self-contained — Stripe collects the email on its own hosted page, with no
// dependency on a backend checkout endpoint.
const STRIPE_PAYMENT_LINK = 'https://buy.stripe.com/dRm6oAbK09Gc0HAdWc0Ba00';

// Mirrors AI_ASSISTANT_ADDON_PRICING in the Harvest app — the assistant is a
// standalone add-on available on any plan (and included free on Ministry).
const PRICE = '$200';

// Compact add-on card shown beneath the pricing plans. Visually distinct from the
// four plan tiers (dark card, gold accent) so it reads as an add-on, not a 5th tier.
export const AiAssistantAddonCard: React.FC = () => {
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

      <div className="md:w-64 md:flex-shrink-0">
        <div className="mb-4 md:text-right">
          <span className="text-gold font-serif text-3xl font-medium">{PRICE}</span>
          <span className="text-white/60 text-sm">/mo</span>
        </div>
        <a
          href={STRIPE_PAYMENT_LINK}
          className="block text-center w-full bg-gold text-white hover:bg-gold-light px-6 py-3 rounded-lg text-sm font-semibold transition-colors"
        >
          Add the Assistant
        </a>
        <p className="mt-2 text-[11px] text-white/45 text-center">Secure checkout via Stripe · cancel anytime</p>
      </div>
    </div>
  );
};

export default AiAssistantAddonCard;
