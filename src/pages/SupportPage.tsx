import React from 'react';

/**
 * Support / FAQ page — extracted from App.tsx (lines 1066–1086).
 * Static FAQ content, no state dependencies.
 */
export default function SupportPage() {
  const faqs = [
    {
      q: "How do I test Riyazs QA workflow?",
      a: "Switch user role from the top-right header role changer badge or logout and log back in with ID 'tester' and password 'tester'. In this role, you possess full global bug creation permissions, comments additions, and can run Reopen confirmations.",
    },
    {
      q: "How do I review Antony Lawrences Developer dashboard?",
      a: "Change account to Antony Lawrence with ID 'developer' and password 'developer'. In this screen, bug listings are filtered strictly to Antony Lawrence's assigned items, mimicking corporate visibility containment parameters.",
    },
    {
      q: "Are bug creations and statuses changes saved permanently?",
      a: "Yes! All changes, custom comments, re-assignments, statuses transitions, and reopened proof images are written to Client-Side LocalStorage, so your data persists safely across iframe or tab reloads.",
    },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-200 select-none">
      <div>
        <h2 className="text-xl font-bold font-sans tracking-tight text-[#dee1fd]">System Support Database Guides</h2>
        <p className="text-xs text-[#8e90a0] font-sans mt-0.5">Quickly resolve credentials protocols, layout switches, or API integration specifications.</p>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, i) => (
          <div key={i} className="bg-[#161a2e] border border-[#2a2d3e] p-4 rounded-xl space-y-2 text-left">
            <h4 className="text-xs font-bold text-[#b8c3ff] font-sans">{faq.q}</h4>
            <p className="text-xs text-[#c4c5d7] leading-relaxed font-sans">{faq.a}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
