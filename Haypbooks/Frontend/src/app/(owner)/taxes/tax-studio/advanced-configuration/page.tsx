'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function AdvancedConfigurationPage() {
  return (
    <PageDocumentation
      title="Advanced Configuration"
      module="TAXES"
      badge="ENT"
      breadcrumb="Taxes / Tax Studio / Advanced Configuration"
      purpose="Advanced Configuration provides enterprise-level tax engine settings that go beyond standard setup — including tax engine mode (simple vs. vertex integration), calculation precedence rules, rounding overrides, and edge-case handling policies. Finance and tax operations teams use this page to fine-tune the automated tax calculation behavior to match complex business scenarios that standard setups cannot accommodate. Changes here affect system-wide tax calculation behavior."
      components={[
        { name: 'Engine Mode Selector', description: 'Toggle between native Haypbooks tax engine and external integration (Avalara, Vertex, TaxJar).' },
        { name: 'Calculation Precedence', description: 'Define the order in which tax rules are evaluated when multiple rules could apply to one transaction.' },
        { name: 'Rounding Override', description: 'Advanced rounding controls: per-line vs. document-level, truncation vs. rounding, and precision.' },
        { name: 'Edge Case Policiese', description: 'Configuration for how the system handles untaxed items, missing tax codes, or no-nexus transactions.' },
        { name: 'Performance Settings', description: 'Cache duration and batch calculation settings for high-volume transaction environments.' },
      ]}
      tabs={['Engine Settings', 'Precedence Rules', 'Rounding', 'Edge Cases', 'Performance']}
      features={[
        'Switch between native and external tax engine integrations',
        'Define rule evaluation precedence to handle overlapping rules',
        'Configure advanced rounding at line or document level',
        'Set policies for untaxed-item and missing-code scenarios',
        'Optimize performance settings for high-volume environments',
        'Audit all changes to advanced configuration with change log',
      ]}
      dataDisplayed={[
        'Current engine mode and integration status',
        'Rule precedence order list',
        'Rounding configuration settings',
        'Edge case policy summary',
        'Last configuration change with user and timestamp',
      ]}
      userActions={[
        'Switch tax engine mode',
        'Reorder rule precedence',
        'Update rounding precision settings',
        'Configure edge case handling policy',
        'Review configuration change history',
      ]}
    />
  )
}

