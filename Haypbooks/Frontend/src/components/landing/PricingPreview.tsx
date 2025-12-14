export default function PricingPreview() {
  const plans = [
    {
      name: 'Free Trial',
      price: '$0',
      duration: '30 days',
      description: 'Perfect for evaluating Haypbooks',
      features: [
        'Full feature access',
        'Unlimited transactions',
        'All reports included',
        'Email support',
        'No credit card required'
      ],
      cta: 'Start Free Trial',
      highlighted: false
    },
    {
      name: 'Basic',
      price: '$29',
      duration: 'per month',
      description: 'For individual professionals and freelancers',
      features: [
        'Unlimited invoices & bills',
        'Bank reconciliation',
        'Basic financial reports',
        'Up to 2 users',
        'Email support'
      ],
      cta: 'Get Started',
      highlighted: false
    },
    {
      name: 'Pro',
      price: '$59',
      duration: 'per month',
      description: 'For growing businesses',
      features: [
        'Everything in Basic',
        'Inventory management',
        'Advanced reports & analytics',
        'Up to 10 users',
        'Priority support',
        'API access'
      ],
      cta: 'Get Started',
      highlighted: true
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      duration: 'pricing',
      description: 'For large organizations',
      features: [
        'Everything in Pro',
        'Unlimited users',
        'Custom integrations',
        'Dedicated account manager',
        'On-premise deployment option',
        'SLA guarantee'
      ],
      cta: 'Contact Sales',
      highlighted: false
    }
  ]

  return (
    <section className="py-20 px-4 bg-gradient-to-br from-blue-50 to-sky-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-gray-600">
            Start with a free trial. No credit card required. Cancel anytime.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan, idx) => (
            <div 
              key={idx}
              className={`relative bg-white rounded-2xl p-8 ${
                plan.highlighted 
                  ? 'border-2 border-blue-500 shadow-2xl scale-105' 
                  : 'border border-gray-200 shadow-lg'
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-500 text-white text-sm font-semibold px-4 py-1 rounded-full">
                    Most Popular
                  </span>
                </div>
              )}
              
              <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
              <p className="text-gray-600 text-sm mb-4 min-h-[40px]">{plan.description}</p>
              
              <div className="mb-6">
                <span className="text-4xl font-bold">{plan.price}</span>
                {plan.duration && (
                  <span className="text-gray-500 ml-2">/ {plan.duration}</span>
                )}
              </div>
              
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, featureIdx) => (
                  <li key={featureIdx} className="flex items-start text-sm">
                    <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              
              <button 
                className={`w-full py-3 rounded-lg font-semibold transition-all ${
                  plan.highlighted
                    ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <p className="text-gray-600">
            All plans include free updates, data migration assistance, and online training resources.
          </p>
        </div>
      </div>
    </section>
  )
}
