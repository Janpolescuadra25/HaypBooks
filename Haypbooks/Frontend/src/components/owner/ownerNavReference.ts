import { navigationData as ownerAdminNavData } from './ownerAdminNavConfig'
import { navigationData as practiceAdminNavData } from './practiceAdminNavConfig'
import { navigationData as companyAdminNavData } from './companyAdminNavConfig'

const allNavSections = [
  ...ownerAdminNavData,
  ...practiceAdminNavData,
  ...companyAdminNavData,
]

export const ownerNav = Array.from(
  new Map(allNavSections.map((section) => [section.title, section])).values()
)

export const navigationData = ownerNav
