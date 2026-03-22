'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function RuleEnginePage() {
  return (
    <PageDocumentation
      title="Rule Engine"
      module="TAXES"
      badge="ENT"
      breadcrumb="Taxes / Tax Studio / Rule Engine"
      purpose="Rule Engine is the advanced logic layer of the tax system, allowing enterprise tax teams to encode complex conditional tax rules that respond to any combination of transaction attributes — customer type, location, product category, amount threshold, or date. Rules are evaluated in real time during transaction entry, ensuring automated and accurate tax determination across even the most complex multi-variable scenarios. The rule engine replaces the need for manual tax overrides and reduces audit risk from human error."
      components={[
        { name: 'Rule Library', description: 'List of all defined rules with name, condition summary, resulting tax action, and priority rank.' },
        { name: 'Visual Rule Builder', description: 'Drag-and-drop condition builder for defining IF-THEN-ELSE logic without coding.' },
        { name: 'Attribute Selector', description: 'Picker for available transaction attributes that can be used as rule conditions.' },
        { name: 'Test Harness', description: 'Simulated transaction input to test rule evaluation outcome before activating a rule in production.' },
        { name: 'Rule Conflict Detector', description: 'Automatic detection of two rules that could fire simultaneously, with reconciliation options.' },
      ]}
      tabs={['Rule Library', 'Rule Builder', 'Test Harness', 'Conflict Report']}
      features={[
        'Build conditional tax rules with visual IF-THEN logic editor',
        'Reference any transaction attribute (type, location, amount, date) as a condition',
        'Prioritize rules to control evaluation order on overlapping conditions',
        'Test rules against simulated transactions before going live',
        'Detect and resolve conflicting rules',
        'Audit log of all rule changes with before/after comparison',
      ]}
      dataDisplayed={[
        'Rule name, description, and priority',
        'Condition logic summary',
        'Resulting tax action (apply code, rate, exempt)',
        'Conflict status and conflicting rule name',
        'Last modified date and user',
      ]}
      userActions={[
        'Create a new tax rule via visual builder',
        'Set rule priority order',
        'Run rule test with sample transaction',
        'Resolve rule conflicts',
        'Activate or deactivate rules',
      ]}
    />
  )
}

