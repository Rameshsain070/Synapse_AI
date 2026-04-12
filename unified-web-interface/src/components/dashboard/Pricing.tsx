"use client";

import { Check, Sparkles, Zap, Crown } from "lucide-react";

const plans = [
  {
    name: "Open Source",
    price: "Free",
    period: "forever",
    description: "Full platform, self-hosted",
    icon: Sparkles,
    color: "border-gray-700",
    features: [
      "All 13 platform features",
      "LangGraph agents",
      "Chat & task management",
      "PostgreSQL + pgvector",
      "Docker deployment",
      "Community support",
    ],
    cta: "Get Started",
    ctaStyle: "bg-gray-800 hover:bg-gray-700 text-white",
    href: "https://github.com/Rameshsain070/Synapse_AI",
  },
  {
    name: "Pro",
    price: "$29",
    period: "/month",
    description: "Managed hosting & premium models",
    icon: Zap,
    color: "border-indigo-500/50",
    popular: true,
    features: [
      "Everything in Open Source",
      "Managed cloud hosting",
      "Priority GPT-5 access",
      "10 GB vector storage",
      "Advanced analytics",
      "Email support",
    ],
    cta: "Coming Soon",
    ctaStyle: "bg-indigo-600 hover:bg-indigo-700 text-white",
    href: "#",
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "Dedicated infrastructure",
    icon: Crown,
    color: "border-gray-700",
    features: [
      "Everything in Pro",
      "Dedicated infrastructure",
      "Custom model fine-tuning",
      "Unlimited vector storage",
      "SLA & priority support",
      "SSO & RBAC",
    ],
    cta: "Contact Us",
    ctaStyle: "bg-gray-800 hover:bg-gray-700 text-white",
    href: "https://github.com/Rameshsain070/Synapse_AI/issues",
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="max-w-6xl mx-auto px-4 py-16">
      <div className="text-center mb-10">
        <p className="text-xs text-emerald-400 uppercase tracking-widest mb-3 font-semibold">Simple Pricing</p>
        <h2 className="text-3xl font-bold text-white mb-3">Choose Your Plan</h2>
        <p className="text-gray-400 max-w-xl mx-auto">
          Start free with the open source platform. Scale up when you need managed hosting and premium features.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-4xl mx-auto">
        {plans.map((plan) => {
          const Icon = plan.icon;
          return (
            <div
              key={plan.name}
              className={`relative bg-gray-900 border ${plan.color} rounded-2xl p-6 flex flex-col ${
                plan.popular ? "ring-1 ring-indigo-500/30" : ""
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-indigo-600 text-white text-[10px] font-semibold rounded-full">
                  Most Popular
                </span>
              )}
              <div className="mb-4">
                <Icon size={20} className="text-indigo-400 mb-3" />
                <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                <p className="text-xs text-gray-500 mt-1">{plan.description}</p>
              </div>
              <div className="mb-5">
                <span className="text-3xl font-bold text-white">{plan.price}</span>
                {plan.period && <span className="text-sm text-gray-500 ml-1">{plan.period}</span>}
              </div>
              <ul className="space-y-2.5 mb-6 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-gray-300">
                    <Check size={16} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
              <a
                href={plan.href}
                target={plan.href.startsWith("http") ? "_blank" : undefined}
                rel={plan.href.startsWith("http") ? "noopener noreferrer" : undefined}
                className={`w-full text-center py-2.5 rounded-xl text-sm font-semibold transition-colors ${plan.ctaStyle}`}
              >
                {plan.cta}
              </a>
            </div>
          );
        })}
      </div>
    </section>
  );
}
