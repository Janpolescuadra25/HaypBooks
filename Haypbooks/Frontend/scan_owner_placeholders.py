import pathlib, re
root = pathlib.Path('src/app/(owner)')
matcher = re.compile(r'DataTable|Chart|Form|Analytics|const\s+data')
candidate_pages = []
for p in root.rglob('page.tsx'):
    txt = p.read_text(encoding='utf-8')
    has_api = bool(re.search(r'fetch\(|axios|useQuery|useSWR|trpc|prisma', txt))
    has_hardcoded = bool(re.search(r'const\s+\w+\s*=\s*\[', txt))
    has_pagedoc = 'PageDocumentation' in txt
    has_comingsoon = 'ComingSoon' in txt
    if has_pagedoc or (has_hardcoded and not has_api):
        category = 'Shell/Template' if has_pagedoc and not has_hardcoded else 'Hardcoded Data'
        candidate_pages.append((str(p), category, has_api, has_hardcoded, has_pagedoc, has_comingsoon))

print('total candidate pages', len(candidate_pages))
for p, cat, api, hc, pd, cs in candidate_pages:
    print(cat, 'api', api, 'hardcoded', hc, 'pagedoc', pd, 'coming', cs, p)
