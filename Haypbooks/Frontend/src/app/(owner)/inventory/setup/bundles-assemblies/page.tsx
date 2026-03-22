'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Bundles & Assemblies"
      module="INVENTORY"
      breadcrumb="Inventory / Setup / Bundles & Assemblies"
      purpose="Define product bundles and assembly bills of materials (BOMs). Bundles group items sold together while assemblies represent manufactured products built from component parts."
      components={[
        { name: "Bundle List", description: "All defined bundles with component count and bundle price" },
        { name: "Assembly BOM", description: "Bill of materials for manufactured items listing all components and quantities" },
        { name: "Component Availability", description: "Stock levels for all BOM components to determine buildable quantity" },
        { name: "Auto-Explode on Sale", description: "Deduct component inventory automatically when assembly is sold" },
        { name: "Assembly Work Order", description: "Create build order to assemble finished goods from components" },
      ]}
      tabs={["Bundles","Assemblies (BOM)","Work Orders","Build History"]}
      features={["Bundle pricing rules","BOM management","Build-quantity calculator","Component stock availability","Auto-deduct on assembly"]}
      dataDisplayed={["Bundle or assembly name","Component list and quantities","Build cost vs. sell price","Available to build quantity","Labor cost if applicable"]}
      userActions={["Create bundle","Define assembly BOM","Check available to build","Create work order","Disassemble assembly"]}
    />
  )
}

