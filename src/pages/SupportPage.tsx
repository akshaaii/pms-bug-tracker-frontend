import React from 'react';

/**
 * Support / FAQ page. Static content, no state dependencies.
 */
export default function SupportPage() {
  const faqs = [
    {
      q: "How do I test the QA Lead workflow?",
      a: "Switch roles from the header's quick-login options, or log in with username/password 'tester'. This role can create bugs, add comments, and confirm reopen requests.",
    },
    {
      q: "How do I review a developer's dashboard?",
      a: "Log in with username/password 'developer'. Bug listings are filtered to only that developer's assigned items.",
    },
    {
      q: "Are bug creations and status changes saved permanently?",
      a: "Yes. All changes, comments, reassignments, status transitions, and reopen evidence are written to the backend database, so your data persists across sessions and devices.",
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
