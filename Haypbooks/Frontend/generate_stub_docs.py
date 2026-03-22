import os
from pathlib import Path

BASE = Path(r"C:\Users\HomePC\Desktop\Haypbooksv9\Haypbooks\Frontend\src\app\(owner)")

def title_from_slug(slug: str) -> str:
    return ' '.join(word.capitalize() for word in slug.replace('-', ' ').split())

# For readability in the page docs, make module from first segment
for path in BASE.rglob('page.tsx'):
    text = path.read_text(encoding='utf-8')
    if "import ComingSoon from '@/components/owner/ComingSoon'" not in text:
        continue

    rel = path.relative_to(BASE)
    parts = rel.parts
    if len(parts) < 2:
        continue

    module = parts[0].replace('-', ' ').upper()
    sub_path = ' / '.join(parts[:-1])
    page_slug = parts[-2]
    title = title_from_slug(page_slug)

    # Build a rich, reusable docs template
    purpose = (
        f"{title} is the central workspace for {sub_path} and acts as the primary interface for users to manage "
        f"operations, review data, and perform key business tasks. Users review metrics, configure settings, and "
        "take action as needed in this area."
    )

    components = [
        ("Main Actions", f"Primary action controls for creating, editing, and reviewing {title.lower()} items."),
        ("Filters", "Dynamic filters for date range, status, and relevant category to focus on target data."),
        ("Data Table", "Detailed data table with sortable columns, pagination, and row actions."),
        ("Insight Cards", "Summary KPI cards showing top-level metrics and status in this module."),
    ]

    tabs = ["Overview", "List", "Reports", "Settings"]

    features = [
        f"Full data lifecycle support in {title}",
        "Search, filter, and sort across all records",
        "Export functionality to CSV/Excel/PDF",
        "Role-based access and audit trail entries",
        "In-app guided help and documentation",
    ]

    data_displayed = [
        f"Primary {title} dataset (records and statuses)",
        "Aggregated summary totals and period comparisons",
        "Linked related entities and history details",
        "Validation and warning states for manual review",
    ]

    user_actions = [
        f"Create a new {title} entry",
        f"Edit or contextualize existing {title} data",
        "Apply filters and save views",
        "Run reports and export results",
        "Review and resolve exceptions",
    ]

    related_pages = [
        {"label": "Dashboard", "href": "/(owner)/home/dashboard"},
        {"label": "Setup Center", "href": "/(owner)/home/setup-center"},
    ]

    code = f"""import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {{
  return (
    <PageDocumentation
      title={{{{`{title}`}}}}
      module="{module}"
      breadcrumb="{sub_path}"
      purpose="{purpose}"
      components={{[
{os.linesep.join(['        { name: %r, description: %r },' % (c[0], c[1]) for c in components])}
      ]}}
      tabs={{[{', '.join('"%s"' % t for t in tabs)}]}}
      features={{[
{os.linesep.join(['        %r,' % f for f in features])}
      ]}}
      dataDisplayed={{[
{os.linesep.join(['        %r,' % d for d in data_displayed])}
      ]}}
      userActions={{[
{os.linesep.join(['        %r,' % a for a in user_actions])}
      ]}}
      relatedPages={{[
{os.linesep.join(['        { label: %r, href: %r },' % (r['label'], r['href']) for r in related_pages])}
      ]}}
    />
  )
}}
"""
    path.write_text(code, encoding='utf-8')

print('Completed sweep for ComingSoon pages.')
