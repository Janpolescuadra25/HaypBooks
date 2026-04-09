import pathlib, re
root = pathlib.Path('src/app/(owner)')
matcher = re.compile(r'DataTable|Chart|Form|Analytics|const\\s+data')
replaces = []
for p in root.rglob('page.tsx'):
    text = p.read_text('utf-8')
    if "import ComingSoon from '@/components/owner/ComingSoon'" in text:
        continue
    if not matcher.search(text):
        continue
    replaces.append(str(p))
    title = p.parent.name.replace('-', ' ').title()
    out = f"import ComingSoon from '@/components/owner/ComingSoon'\n\nexport default function Page() {{\n  return (\n    <div className='p-4 min-h-[calc(100vh-4rem)]'>\n      <ComingSoon\n        title='{title}'\n        description='This feature is being streamlined with Coming Soon placeholder content while the full implementation is finalized.'\n      />\n    </div>\n  )\n}}\n"
    p.write_text(out, 'utf-8')
print('patched', len(replaces), 'files')
for r in replaces:
    print(r)
