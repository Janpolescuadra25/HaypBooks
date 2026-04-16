const fs = require('fs');
const path = require('path');

const repoRoot = process.cwd();
const frontendRoot = path.join(repoRoot, 'Haypbooks', 'Frontend');
const backendRoot = path.join(repoRoot, 'Haypbooks', 'Backend');
const ownerAppRoot = path.join(frontendRoot, 'src', 'app', '(owner)');
const componentsRoot = path.join(frontendRoot, 'src', 'components');
const backendSrcRoot = path.join(backendRoot, 'src');
const schemaPath = path.join(backendRoot, 'prisma', 'schema.prisma');
const seedPath = path.join(backendRoot, 'prisma', 'seed.ts');
const outDir = path.join(repoRoot, 'docs', 'system-map');

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function read(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch {
    return '';
  }
}

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

function rel(filePath) {
  return path.relative(repoRoot, filePath).replace(/\\/g, '/');
}

function uniq(arr) {
  return [...new Set(arr.filter(Boolean))];
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function normalizeEndpoint(ep) {
  if (!ep) return '';
  let value = String(ep).trim();
  if (!value) return '';

  // Strip protocol/domain if present
  value = value.replace(/^https?:\/\/[^/]+/i, '');

  // Keep only path part before query/hash
  value = value.split('?')[0].split('#')[0];

  // Replace template expressions
  value = value.replace(/\$\{[^}]+\}/g, ':param');
  // Handle malformed trailing template fragments like `${params`
  value = value.replace(/\$\{[^/]+$/g, ':param');

  // Normalize duplicate slashes
  value = value.replace(/\/+/g, '/');

  if (!value.startsWith('/')) value = '/' + value;
  return value;
}

function extractImports(text) {
  const imports = [];
  const re = /^\s*import\s+([\s\S]*?)\s+from\s+['\"]([^'\"]+)['\"];?/gm;
  let m;
  while ((m = re.exec(text))) {
    imports.push({ spec: m[1].trim(), source: m[2].trim() });
  }
  return imports;
}

function importNames(spec) {
  const names = [];
  if (!spec) return names;
  let value = spec.replace(/^type\s+/, '').trim();

  // default import
  if (!value.startsWith('{') && !value.startsWith('*')) {
    const first = value.split(',')[0].trim();
    if (first) names.push(first);
  }

  // named imports
  const namedMatch = value.match(/\{([\s\S]*?)\}/);
  if (namedMatch) {
    const parts = namedMatch[1].split(',').map(s => s.trim()).filter(Boolean);
    for (const p of parts) {
      const asParts = p.split(/\s+as\s+/i).map(s => s.trim()).filter(Boolean);
      if (asParts[1]) names.push(asParts[1]);
      else if (asParts[0]) names.push(asParts[0]);
    }
  }

  // namespace import
  const ns = value.match(/\*\s+as\s+([A-Za-z0-9_]+)/);
  if (ns) names.push(ns[1]);

  return uniq(names);
}

function extractEndpoints(text) {
  const found = [];

  const callPatterns = [
    /(apiClient|axios)\.(get|post|put|patch|delete|request)\(\s*([`'\"])([\s\S]*?)\3/gm,
    /fetch\(\s*([`'\"])([\s\S]*?)\1/gm,
  ];

  for (const re of callPatterns) {
    let m;
    while ((m = re.exec(text))) {
      const raw = m[m.length - 1];
      const normalized = normalizeEndpoint(raw);
      if (normalized.includes('/companies/') || normalized.startsWith('/api/')) {
        found.push(normalized);
      }
    }
  }

  // Generic path literals in strings (covers helper constants)
  const generic = /([`'\"])(\/(?:api|companies)\/[A-Za-z0-9_\-\/:.${}]+)\1/gm;
  let g;
  while ((g = generic.exec(text))) {
    const normalized = normalizeEndpoint(g[2]);
    if (normalized) found.push(normalized);
  }

  return uniq(found).sort();
}

function classifyStatus(text, endpointCount, extraSignals = '') {
  const l = (text + '\n' + extraSignals).toLowerCase();
  const stubSignals = [
    'coming soon',
    'placeholder',
    'todo',
    'not implemented',
    'stub',
    'mock',
  ];
  const hasStubSignal = stubSignals.some(s => l.includes(s));
  if (hasStubSignal && endpointCount === 0) return 'stub/placeholder';
  if (hasStubSignal && endpointCount > 0) return 'partial';
  if (endpointCount === 0 && /tabcomingsoon|sectioncomingsoon|comingsoonpage/i.test(l)) return 'stub/placeholder';
  if (endpointCount === 0) return 'ui-only/unknown';
  return 'real';
}

function headingPurpose(text, fallbackName) {
  const h1 = text.match(/<h1[^>]*>\s*([^<]{3,80})\s*<\/h1>/i);
  if (h1) return h1[1].trim();
  const title = text.match(/title\s*[:=]\s*['\"]([^'\"]{3,80})['\"]/i);
  if (title) return title[1].trim();
  return fallbackName
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[-_]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function resolveImportToFile(fromFile, source) {
  if (!source) return null;
  let base;
  if (source.startsWith('@/')) {
    base = path.join(frontendRoot, 'src', source.slice(2));
  } else if (source.startsWith('.')) {
    base = path.resolve(path.dirname(fromFile), source);
  } else {
    return null;
  }

  const candidates = [
    base,
    base + '.tsx',
    base + '.ts',
    base + '.jsx',
    base + '.js',
    path.join(base, 'index.tsx'),
    path.join(base, 'index.ts'),
    path.join(base, 'page.tsx'),
  ];

  for (const c of candidates) {
    if (fs.existsSync(c) && fs.statSync(c).isFile()) return c;
  }
  return null;
}

function routeFromOwnerPage(filePath) {
  const relToOwner = path.relative(ownerAppRoot, filePath).replace(/\\/g, '/');
  const noPage = relToOwner.replace(/\/page\.tsx$/, '');
  if (!noPage) return '/';
  return '/' + noPage;
}

function parseControllerBase(text) {
  const m = text.match(/@Controller\(\s*['\"]([^'\"]+)['\"]\s*\)/);
  return m ? m[1] : '';
}

function joinRoute(base, sub) {
  const b = (base || '').trim().replace(/^\/+|\/+$/g, '');
  const s = (sub || '').trim().replace(/^\/+|\/+$/g, '');
  if (!b && !s) return '/';
  if (!b) return '/' + s;
  if (!s) return '/' + b;
  return '/' + b + '/' + s;
}

function parseControllerEndpoints(text, controllerPath) {
  const base = parseControllerBase(text);
  const endpoints = [];
  const lines = text.split(/\r?\n/);
  const httpDecoratorRe = /^\s*@(Get|Post|Put|Patch|Delete|Head|Options)\(\s*(?:[`'\"]([^`'\"]*)[`'\"])?\s*\)/;
  const methodSigRe = /^\s*(?:public\s+|private\s+|protected\s+)?(?:async\s+)?([A-Za-z0-9_]+)\s*\(/;

  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(httpDecoratorRe);
    if (!m) continue;

    const method = m[1].toUpperCase();
    const sub = m[2] || '';
    let handler = 'unknownHandler';

    // Find the next function signature, skipping additional decorators.
    for (let j = i + 1; j < Math.min(lines.length, i + 30); j++) {
      const nextLine = lines[j];
      if (!nextLine || !nextLine.trim()) continue;
      if (/^\s*@/.test(nextLine)) continue;
      const mm = nextLine.match(methodSigRe);
      if (mm) {
        handler = mm[1];
      }
      break;
    }

    const pathNoApi = joinRoute(base, sub);
    const fullPath = pathNoApi.startsWith('/api/')
      ? pathNoApi
      : ('/api' + (pathNoApi === '/' ? '' : pathNoApi));
    endpoints.push({ method, pathNoApi, fullPath, handler, controller: rel(controllerPath) });
  }
  return endpoints;
}

function chooseRenderedComponent(text, imports, pageFile) {
  const sourceByName = new Map();
  for (const imp of imports) {
    for (const n of importNames(imp.spec)) sourceByName.set(n, imp.source);
  }

  const tagNames = [...text.matchAll(/<([A-Z][A-Za-z0-9_]*)\b/g)].map(m => m[1]);

  // Prefer components imported from src/components
  for (const tag of tagNames) {
    const src = sourceByName.get(tag);
    if (!src) continue;
    if (src.startsWith('@/components') || src.includes('/components/')) {
      const file = resolveImportToFile(pageFile, src);
      return { renderedName: tag, renderedSource: src, renderedFile: file };
    }
  }

  // Then prefer relative imports (often local page composition)
  for (const tag of tagNames) {
    const src = sourceByName.get(tag);
    if (!src) continue;
    if (src.startsWith('.')) {
      const file = resolveImportToFile(pageFile, src);
      return { renderedName: tag, renderedSource: src, renderedFile: file };
    }
  }

  // Fallback: any imported upper component except obvious library icon imports
  for (const tag of tagNames) {
    const src = sourceByName.get(tag);
    if (!src) continue;
    const lowerSrc = src.toLowerCase();
    if (lowerSrc.includes('lucide-react') || lowerSrc.includes('react') || lowerSrc.includes('next/')) continue;
    const file = resolveImportToFile(pageFile, src);
    return { renderedName: tag, renderedSource: src, renderedFile: file };
  }

  return { renderedName: '', renderedSource: '', renderedFile: null };
}

function parsePrismaModels(schemaText) {
  const models = [];
  const modelNames = [];
  const modelRe = /model\s+([A-Za-z0-9_]+)\s*\{/gm;
  let m;
  while ((m = modelRe.exec(schemaText))) {
    modelNames.push(m[1]);
  }
  const modelSet = new Set(modelNames);

  const lines = schemaText.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const open = lines[i].match(/^model\s+([A-Za-z0-9_]+)\s*\{/);
    if (!open) continue;
    const name = open[1];
    let depth = 0;
    const block = [];
    for (let j = i; j < lines.length; j++) {
      const line = lines[j];
      if (line.includes('{')) depth += (line.match(/\{/g) || []).length;
      if (line.includes('}')) depth -= (line.match(/\}/g) || []).length;
      block.push(line);
      if (depth === 0) {
        i = j;
        break;
      }
    }

    const relationTargets = new Set();
    for (const rawLine of block.slice(1, -1)) {
      const line = rawLine.trim();
      if (!line || line.startsWith('//') || line.startsWith('@@')) continue;
      const parts = line.split(/\s+/);
      if (parts.length < 2) continue;
      const typeRaw = parts[1].replace(/[?\[\]]/g, '');
      if (modelSet.has(typeRaw)) relationTargets.add(typeRaw);
    }

    models.push({ name, relationTargets: [...relationTargets].sort() });
  }

  return models;
}

function splitPathSegments(p) {
  return p.replace(/^\/+|\/+$/g, '').split('/').filter(Boolean);
}

function pathsMatch(frontPath, backPath) {
  const a = splitPathSegments(frontPath);
  const b = splitPathSegments(backPath);
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    const x = a[i];
    const y = b[i];
    const xParam = x.startsWith(':') || x === ':param' || (/^\{[^}]+\}$/.test(x));
    const yParam = y.startsWith(':') || y === ':param' || (/^\{[^}]+\}$/.test(y));
    if (x === y || xParam || yParam) continue;
    return false;
  }
  return true;
}

function toApiPath(ep) {
  const n = normalizeEndpoint(ep);
  if (!n) return '';
  return n.startsWith('/api/') ? n : '/api' + n;
}

function isLookupEndpointForSeed(ep) {
  const p = normalizeEndpoint(ep).toLowerCase();
  if (!p) return false;
  if (p.includes('/:param/')) return false;
  if (p.endsWith('/:param')) return false;
  if (/(\/activity|\/void|\/post|\/approve|\/reverse|\/process|\/convert|\/send|\/status|\/export|\/batch|\/generate|\/recognize|\/reopen|\/close)$/.test(p)) {
    return false;
  }
  return true;
}

function isListOrFindEndpoint(ep) {
  const p = normalizeEndpoint(ep).toLowerCase();
  if (!p) return false;
  if (/(\/activity|\/void|\/post|\/approve|\/reverse|\/process|\/convert|\/send|\/status|\/export|\/batch|\/generate|\/recognize|\/reopen|\/close)$/.test(p)) {
    return false;
  }
  if (/(\/find|\/search|\/lookup|\/list)(\/|$)/.test(p)) return true;
  if (p.endsWith('/:param')) return true;
  return !p.includes('/:param/');
}

function inferModelFromEndpoint(ep) {
  const p = normalizeEndpoint(ep).toLowerCase();
  if (!p) return null;

  const endpointModelHints = [
    ['/banking/accounts', 'bankAccount'],
    ['/bank-accounts', 'bankAccount'],
    ['/payment-method', 'paymentMethod'],
    ['/payment-terms', 'paymentTerm'],
    ['/accounting/accounts', 'account'],
    ['/general-ledger/account-list', 'account'],
    ['/companies/:param/accounts', 'account'],
    ['/tax-rates', 'taxRate'],
    ['/ap/vendors', 'vendor'],
    ['/contacts/vendors', 'vendor'],
    ['/vendors', 'vendor'],
    ['/ar/customers', 'customer'],
    ['/customers', 'customer'],
    ['/ar/invoices', 'invoice'],
    ['/invoices', 'invoice'],
    ['/inventory/items', 'item'],
    ['/payroll/employees', 'employee'],
    ['/employees', 'employee'],
    ['/projects', 'project'],
  ];

  for (const [hint, model] of endpointModelHints) {
    if (p.includes(hint)) return model;
  }

  return null;
}

function isModelSeeded(seededModels, model) {
  const seededSet = new Set(seededModels.map(x => String(x).toLowerCase()));
  const candidates = [
    String(model),
    String(model)[0].toUpperCase() + String(model).slice(1),
  ].map(x => x.toLowerCase());
  return candidates.some(c => seededSet.has(c));
}

function extractFkFieldDependencies(text) {
  const fkFieldModelHints = [
    { field: 'bankAccountId', model: 'bankAccount' },
    { field: 'paymentMethodId', model: 'paymentMethod' },
    { field: 'accountId', model: 'account' },
    { field: 'taxId', model: 'taxRate' },
  ];

  const found = [];
  for (const hint of fkFieldModelHints) {
    const re = new RegExp(`\\b${hint.field}\\b`);
    if (re.test(text)) {
      found.push({ ...hint });
    }
  }
  return found;
}

function extractExpectedAccountDependencies(backendFiles) {
  const byKey = new Map();
  const prioritizedNames = [
    'Undeposited Funds',
    'Business Checking',
    'Accounts Receivable',
    'Accounts Payable',
    'Service Revenue',
    'Sales Revenue',
    'Cash',
    'Inventory Suspense',
  ];
  const accountCodePattern = /['"`]([0-9]{3,6}|[A-Z0-9]+-[A-Z0-9-]+)['"`]/g;

  for (const file of backendFiles) {
    const fileRel = rel(file);
    const text = read(file);
    const lines = text.split(/\r?\n/);

    for (const name of prioritizedNames) {
      if (!text.includes(name)) continue;
      const key = `name|${name.toLowerCase()}`;
      if (!byKey.has(key)) {
        byKey.set(key, { indicatorType: 'name', indicator: name, sourceFile: fileRel });
      }
    }

    const codeLookupPatterns = [
      /findDefaultAccountByCode\([^)]*?['"`]([0-9]{3,6}|[A-Z0-9]+-[A-Z0-9-]+)['"`][^)]*\)/g,
      /findOrCreateAccountByCode\([^)]*?['"`]([0-9]{3,6}|[A-Z0-9]+-[A-Z0-9-]+)['"`][^)]*\)/g,
    ];

    for (const re of codeLookupPatterns) {
      for (const match of text.matchAll(re)) {
        const code = match[1];
        const key = `code|${code}`;
        if (!byKey.has(key)) {
          byKey.set(key, { indicatorType: 'code', indicator: code, sourceFile: fileRel });
        }
      }
    }

    for (const line of lines) {
      if (!/\b(code|accountCode)\b/i.test(line)) continue;
      if (!/\b(account|gl|ledger|coa|chart)\b/i.test(line)) continue;
      for (const match of line.matchAll(accountCodePattern)) {
        const code = match[1];
        const key = `code|${code}`;
        if (!byKey.has(key)) {
          byKey.set(key, { indicatorType: 'code', indicator: code, sourceFile: fileRel });
        }
      }
    }
  }

  return [...byKey.values()].sort((a, b) => {
    if (a.indicatorType !== b.indicatorType) return a.indicatorType.localeCompare(b.indicatorType);
    return a.indicator.localeCompare(b.indicator);
  });
}

function classifyUnusedBackendRoute(path, moduleName, methods) {
  const p = path.toLowerCase();
  const m = String(moduleName || '').toLowerCase();

  const backendOnlyModules = new Set(['auth', 'attachments']);
  if (backendOnlyModules.has(m)) {
    return {
      classification: 'Backend-only',
      reason: 'Auth/attachment infrastructure endpoint is typically consumed outside owner pages.',
    };
  }

  const backendOnlyPathSignals = [
    '/webhook',
    '/callbacks',
    '/internal',
    '/health',
    '/metrics',
    '/feed-connections',
    '/feed-status',
    '/bank-feed/imports',
    '/sync',
    '/scim',
  ];
  if (backendOnlyPathSignals.some(signal => p.includes(signal))) {
    return {
      classification: 'Backend-only',
      reason: 'Route pattern suggests integration/system processing rather than owner-facing UI.',
    };
  }

  if (methods.length === 1 && methods[0] === 'POST' && /(\/run|\/generate|\/complete)$/.test(p)) {
    return {
      classification: 'Backend-only',
      reason: 'Single-purpose command endpoint likely used by orchestration jobs or admin flows.',
    };
  }

  return {
    classification: 'Missing UI',
    reason: 'Business endpoint appears owner-relevant but no owner page currently calls it.',
  };
}

function moduleFromEndpoint(ep) {
  const p = ep.toLowerCase();
  const pairs = [
    ['/ar/', 'ar'],
    ['/ap/', 'ap'],
    ['/banking/', 'banking'],
    ['/accounting/', 'accounting'],
    ['/inventory/', 'inventory'],
    ['/sales/', 'sales'],
    ['/expenses/', 'expenses'],
    ['/onboarding/', 'onboarding'],
    ['/projects/', 'projects'],
    ['/reporting/', 'reporting'],
    ['/tax/', 'tax'],
    ['/payroll/', 'payroll'],
    ['/time/', 'time'],
    ['/organization/', 'organization'],
    ['/integrations/', 'integrations'],
    ['/contacts/', 'contacts'],
    ['/auth/', 'auth'],
    ['/companies/', 'companies'],
    ['/workspace', 'companies'],
  ];
  for (const [needle, moduleName] of pairs) {
    if (p.includes(needle)) return moduleName;
  }
  return 'unknown';
}

function toMarkdownTable(rows, headers) {
  const head = '| ' + headers.join(' | ') + ' |';
  const sep = '| ' + headers.map(() => '---').join(' | ') + ' |';
  const body = rows.map(r => '| ' + headers.map(h => String(r[h] ?? '').replace(/\n/g, '<br>').replace(/\|/g, '\\|')).join(' | ') + ' |');
  return [head, sep, ...body].join('\n');
}

function main() {
  ensureDir(outDir);

  const allFrontendTsx = walk(frontendRoot).filter(f => f.endsWith('.tsx'));
  const ownerPageFiles = walk(ownerAppRoot).filter(f => f.endsWith(path.join('page.tsx').replace(/\\/g, path.sep)) || f.endsWith('/page.tsx') || f.endsWith('\\page.tsx'));
  const componentFiles = walk(componentsRoot).filter(f => f.endsWith('.tsx'));

  // Components scan
  const components = [];
  const componentByFile = new Map();
  for (const file of componentFiles) {
    const text = read(file);
    const imports = extractImports(text);
    const importSources = imports.map(i => i.source);
    const usesComponents = uniq(importSources.filter(s => s.includes('/components') || s.startsWith('./') || s.startsWith('../')));
    const endpoints = extractEndpoints(text);
    const name = path.basename(file, '.tsx');
    const purpose = headingPurpose(text, name);
    const status = classifyStatus(text, endpoints.length, importSources.join(' '));
    const hasDropdownUi = /<select\b|combobox|dropdown|selecttrigger|listbox/i.test(text);
    const fkFieldDependencies = extractFkFieldDependencies(text);

    const entry = {
      file: rel(file),
      name,
      purpose,
      usesComponents,
      endpoints,
      status,
      hasSelect: /<select\b|combobox/i.test(text),
      hasDropdownUi,
      fkFieldDependencies,
      imports,
    };
    components.push(entry);
    componentByFile.set(file, entry);
  }

  // Pages scan
  const pages = [];
  for (const file of ownerPageFiles) {
    const text = read(file);
    const imports = extractImports(text);
    const { renderedName, renderedSource, renderedFile } = chooseRenderedComponent(text, imports, file);

    const directEndpoints = extractEndpoints(text);
    const componentEndpoints = renderedFile && componentByFile.get(renderedFile)
      ? componentByFile.get(renderedFile).endpoints
      : [];
    const endpoints = uniq([...directEndpoints, ...componentEndpoints]).sort();

    let pageStatus = classifyStatus(text, endpoints.length, `${renderedName} ${renderedSource}`);
    if (renderedFile && componentByFile.get(renderedFile)) {
      const cStatus = componentByFile.get(renderedFile).status;
      if (cStatus === 'stub/placeholder') pageStatus = 'stub/placeholder';
      else if (cStatus === 'partial' && pageStatus !== 'stub/placeholder') pageStatus = 'partial';
      else if (cStatus === 'real' && pageStatus === 'ui-only/unknown') pageStatus = 'real';
    }

    const route = routeFromOwnerPage(file);
    pages.push({
      file: rel(file),
      route,
      renderedComponent: renderedName || '(inline/none)',
      renderedComponentFile: renderedFile ? rel(renderedFile) : '',
      endpoints,
      status: pageStatus,
    });
  }

  // Backend scan
  const controllerFiles = walk(backendSrcRoot).filter(f => f.endsWith('.controller.ts'));
  const moduleFiles = walk(backendSrcRoot).filter(f => f.endsWith('.module.ts'));

  const backendModules = new Map();
  const allBackendEndpoints = [];

  for (const file of controllerFiles) {
    const text = read(file);
    const moduleName = rel(file).split('/')[3] || 'root'; // Haypbooks/Backend/src/<module>/...
    const endpoints = parseControllerEndpoints(text, file);

    const moduleDir = path.join(backendSrcRoot, moduleName);
    const moduleTsFiles = walk(moduleDir).filter(f => f.endsWith('.ts'));
    const prismaModels = new Set();
    for (const tsf of moduleTsFiles) {
      const t = read(tsf);
      const re1 = /\bthis\.prisma\.([A-Za-z0-9_]+)/g;
      const re2 = /\bprisma\.([A-Za-z0-9_]+)/g;
      let m1;
      while ((m1 = re1.exec(t))) prismaModels.add(m1[1]);
      let m2;
      while ((m2 = re2.exec(t))) prismaModels.add(m2[1]);
    }

    const stubSignals = /(coming soon|placeholder|todo|stub|mock)/i.test(text);

    if (!backendModules.has(moduleName)) {
      backendModules.set(moduleName, {
        moduleName,
        controllers: [],
        endpoints: [],
        prismaModels: new Set(),
        stubSignals: false,
      });
    }
    const moduleEntry = backendModules.get(moduleName);
    moduleEntry.controllers.push(rel(file));
    for (const ep of endpoints) {
      moduleEntry.endpoints.push(ep);
      allBackendEndpoints.push({ ...ep, moduleName });
    }
    for (const m of prismaModels) moduleEntry.prismaModels.add(m);
    moduleEntry.stubSignals = moduleEntry.stubSignals || stubSignals;
  }

  const backendModuleList = [...backendModules.values()].map(m => ({
    moduleName: m.moduleName,
    controllers: uniq(m.controllers).sort(),
    endpointCount: m.endpoints.length,
    endpoints: m.endpoints,
    prismaModels: [...m.prismaModels].sort(),
    status: m.stubSignals ? 'has stub/mock signal' : (m.endpoints.length ? 'real' : 'unknown'),
  })).sort((a, b) => a.moduleName.localeCompare(b.moduleName));

  // Prisma models scan
  const schemaText = read(schemaPath);
  const prismaModels = parsePrismaModels(schemaText);

  const backendTsFiles = walk(backendSrcRoot).filter(f => f.endsWith('.ts'));
  const backendTsText = backendTsFiles.map(read).join('\n');
  const frontendTsText = allFrontendTsx.map(read).join('\n');

  const prismaModelUsage = prismaModels.map(model => {
    const re = new RegExp(`\\b${model.name}\\b`, 'g');
    const backendRefs = (backendTsText.match(re) || []).length;
    const frontendRefs = (frontendTsText.match(re) || []).length;
    return {
      model: model.name,
      relations: model.relationTargets,
      backendRefs,
      frontendRefs,
      usedInBackend: backendRefs > 0,
      status: backendRefs > 0 ? 'used' : 'unused-or-very-low-usage',
    };
  }).sort((a, b) => a.model.localeCompare(b.model));

  // Frontend endpoint inventory
  const frontendEndpoints = uniq([
    ...pages.flatMap(p => p.endpoints),
    ...components.flatMap(c => c.endpoints),
  ]).map(normalizeEndpoint).filter(Boolean);

  const normalizedFrontendEndpoints = uniq(frontendEndpoints.map(toApiPath).filter(Boolean));
  const backendPathSet = uniq(allBackendEndpoints.map(ep => toApiPath(ep.fullPath)).filter(Boolean));

  const unmatchedFrontend = [];
  for (const fe of normalizedFrontendEndpoints) {
    const match = backendPathSet.some(be => pathsMatch(fe, be));
    if (!match) unmatchedFrontend.push(fe);
  }

  const unmatchedBackend = [];
  for (const be of backendPathSet) {
    const match = normalizedFrontendEndpoints.some(fe => pathsMatch(fe, be));
    if (!match) unmatchedBackend.push(be);
  }

  const unmatchedBackendRouteTriage = unmatchedBackend
    .map(routePath => {
      const details = allBackendEndpoints.filter(ep => pathsMatch(toApiPath(ep.fullPath), routePath));
      const moduleName = details[0]?.moduleName || moduleFromEndpoint(routePath);
      const methods = uniq(details.map(d => d.method)).sort();
      const triage = classifyUnusedBackendRoute(routePath, moduleName, methods);

      return {
        moduleName,
        path: routePath,
        methods,
        classification: triage.classification,
        reason: triage.reason,
      };
    })
    .sort((a, b) => a.path.localeCompare(b.path));

  const unmatchedBackendByModule = (() => {
    const map = new Map();
    for (const row of unmatchedBackendRouteTriage) {
      if (!map.has(row.moduleName)) {
        map.set(row.moduleName, {
          moduleName: row.moduleName,
          total: 0,
          backendOnly: 0,
          missingUi: 0,
          routes: [],
        });
      }
      const group = map.get(row.moduleName);
      group.total += 1;
      if (row.classification === 'Backend-only') group.backendOnly += 1;
      else group.missingUi += 1;
      group.routes.push(row);
    }

    return [...map.values()]
      .map(group => ({
        ...group,
        routes: group.routes.sort((a, b) => a.path.localeCompare(b.path)),
      }))
      .sort((a, b) => a.moduleName.localeCompare(b.moduleName));
  })();

  // Page -> backend module dependency
  const pageDependencies = pages.map(p => {
    const modules = uniq(p.endpoints.map(moduleFromEndpoint)).sort();
    return {
      route: p.route,
      pageFile: p.file,
      renderedComponent: p.renderedComponent,
      modules,
      endpointCount: p.endpoints.length,
      status: p.status,
    };
  });

  // Seed data dependency scan
  const seedText = read(seedPath);
  const seededModels = uniq([
    ...[...seedText.matchAll(/\bprisma\.([A-Za-z0-9_]+)\./g)].map(m => m[1]),
    ...[...seedText.matchAll(/\brawInsertWithTenantFallback\(\s*['\"]([A-Za-z0-9_]+)['\"]/g)].map(m => m[1]),
  ]).sort();

  const dropdownDependencies = [];
  for (const component of components) {
    if (!component.hasDropdownUi || component.endpoints.length === 0) continue;
    for (const ep of component.endpoints) {
      if (!isListOrFindEndpoint(ep)) continue;
      const expectedModel = inferModelFromEndpoint(ep);
      if (!expectedModel) continue;
      dropdownDependencies.push({
        component: component.file,
        endpoint: ep,
        expectedModel,
        seeded: isModelSeeded(seededModels, expectedModel),
      });
    }
  }

  const fkDependencies = [];
  for (const component of components) {
    for (const fk of component.fkFieldDependencies || []) {
      fkDependencies.push({
        component: component.file,
        field: fk.field,
        expectedModel: fk.model,
        seeded: isModelSeeded(seededModels, fk.model),
      });
    }
  }

  const expectedAccountDependencies = extractExpectedAccountDependencies(backendTsFiles).map(dep => {
    if (dep.indicatorType === 'code') {
      const re = new RegExp(`['\"\`]${escapeRegExp(dep.indicator)}['\"\`]`, 'i');
      return { ...dep, seeded: re.test(seedText) };
    }
    return { ...dep, seeded: seedText.toLowerCase().includes(dep.indicator.toLowerCase()) };
  });

  const seedGapEntries = [];
  for (const dep of dropdownDependencies) {
    if (!dep.seeded) {
      seedGapEntries.push({
        category: 'dropdown-endpoint',
        component: dep.component,
        endpoint: dep.endpoint,
        indicator: dep.endpoint,
        expectedModel: dep.expectedModel,
        seeded: false,
      });
    }
  }
  for (const dep of fkDependencies) {
    if (!dep.seeded) {
      seedGapEntries.push({
        category: 'fk-field',
        component: dep.component,
        endpoint: '',
        indicator: dep.field,
        expectedModel: dep.expectedModel,
        seeded: false,
      });
    }
  }
  for (const dep of expectedAccountDependencies) {
    if (!dep.seeded) {
      seedGapEntries.push({
        category: 'gl-account-constant',
        component: dep.sourceFile,
        endpoint: '',
        indicator: `${dep.indicatorType}:${dep.indicator}`,
        expectedModel: 'account',
        seeded: false,
      });
    }
  }

  const seedGaps = uniq(seedGapEntries.map(x => JSON.stringify(x))).map(x => JSON.parse(x));

  // Missing piece summaries
  const pageStubCount = pages.filter(p => p.status === 'stub/placeholder').length;
  const pageRealCount = pages.filter(p => p.status === 'real').length;
  const componentStubCount = components.filter(c => c.status === 'stub/placeholder').length;
  const componentRealCount = components.filter(c => c.status === 'real').length;

  const topModuleUsage = Object.entries(
    pageDependencies
      .flatMap(p => p.modules)
      .reduce((acc, m) => { acc[m] = (acc[m] || 0) + 1; return acc; }, {})
  )
    .sort((a, b) => b[1] - a[1])
    .map(([module, count]) => ({ module, pageCount: count }));

  const backendOnlyRouteCount = unmatchedBackendRouteTriage.filter(r => r.classification === 'Backend-only').length;
  const missingUiRouteCount = unmatchedBackendRouteTriage.filter(r => r.classification === 'Missing UI').length;

  // Write JSON artifacts
  const artifacts = {
    generatedAt: new Date().toISOString(),
    counts: {
      ownerPages: pages.length,
      components: components.length,
      backendModules: backendModuleList.length,
      backendControllers: controllerFiles.length,
      backendEndpoints: allBackendEndpoints.length,
      prismaModels: prismaModelUsage.length,
      frontendEndpoints: normalizedFrontendEndpoints.length,
    },
    pages,
    components,
    backendModules: backendModuleList,
    prismaModels: prismaModelUsage,
    pageDependencies,
    unmatchedFrontendEndpoints: unmatchedFrontend.sort(),
    unmatchedBackendEndpoints: unmatchedBackend.sort(),
    unmatchedBackendRouteTriage,
    unmatchedBackendByModule,
    seedModels: seededModels,
    dropdownDependencies,
    fkDependencies,
    expectedAccountDependencies,
    seedGaps,
    topModuleUsage,
    moduleFiles: moduleFiles.map(rel).sort(),
    controllerFiles: controllerFiles.map(rel).sort(),
  };

  fs.writeFileSync(path.join(outDir, 'owner-hub-map.json'), JSON.stringify(artifacts, null, 2));

  // Build structured markdown document
  const md = [];
  md.push('# Haypbooks Owner Hub System Map');
  md.push('');
  md.push(`Generated: ${artifacts.generatedAt}`);
  md.push('');
  md.push('## Executive Snapshot');
  md.push('');
  md.push(`- Owner pages scanned: ${artifacts.counts.ownerPages}`);
  md.push(`- Components scanned: ${artifacts.counts.components}`);
  md.push(`- Backend modules scanned: ${artifacts.counts.backendModules}`);
  md.push(`- Backend endpoint handlers discovered: ${artifacts.counts.backendEndpoints}`);
  md.push(`- Prisma models scanned: ${artifacts.counts.prismaModels}`);
  md.push(`- Frontend endpoint patterns discovered: ${artifacts.counts.frontendEndpoints}`);
  md.push(`- Page status: ${pageRealCount} real, ${pageStubCount} stub/placeholder`);
  md.push(`- Component status: ${componentRealCount} real, ${componentStubCount} stub/placeholder`);
  md.push('');

  md.push('## 1) Every Page & Route (`Frontend/src/app/(owner)/`)');
  md.push('');
  md.push(toMarkdownTable(
    pages
      .sort((a, b) => a.route.localeCompare(b.route))
      .map(p => ({
        Route: p.route,
        PageFile: p.file,
        Renders: p.renderedComponentFile || p.renderedComponent,
        APIEndpoints: p.endpoints.length ? p.endpoints.join('<br>') : '(none detected)',
        Status: p.status,
      })),
    ['Route', 'PageFile', 'Renders', 'APIEndpoints', 'Status']
  ));
  md.push('');

  md.push('## 2) Every Component (`Frontend/src/components/`)');
  md.push('');
  md.push(toMarkdownTable(
    components
      .sort((a, b) => a.file.localeCompare(b.file))
      .map(c => ({
        ComponentFile: c.file,
        Purpose: c.purpose,
        Uses: c.usesComponents.length ? c.usesComponents.join('<br>') : '(none detected)',
        APIEndpoints: c.endpoints.length ? c.endpoints.join('<br>') : '(none detected)',
        Status: c.status,
      })),
    ['ComponentFile', 'Purpose', 'Uses', 'APIEndpoints', 'Status']
  ));
  md.push('');

  md.push('## 3) Every Backend Module (`Backend/src/`)');
  md.push('');
  for (const m of backendModuleList) {
    md.push(`### Module: ${m.moduleName}`);
    md.push('');
    md.push(`- Controllers: ${m.controllers.length}`);
    md.push(`- Endpoint handlers: ${m.endpointCount}`);
    md.push(`- Prisma models used: ${m.prismaModels.length ? m.prismaModels.join(', ') : '(none detected)'}`);
    md.push(`- Status signal: ${m.status}`);
    if (m.endpoints.length) {
      md.push('');
      md.push(toMarkdownTable(
        m.endpoints.map(ep => ({
          Method: ep.method,
          Path: ep.fullPath,
          Handler: ep.handler,
          Controller: ep.controller,
        })),
        ['Method', 'Path', 'Handler', 'Controller']
      ));
    }
    md.push('');
  }

  md.push('## 4) Every Prisma Model (`Backend/prisma/schema.prisma`)');
  md.push('');
  md.push(toMarkdownTable(
    prismaModelUsage.map(m => ({
      Model: m.model,
      KeyRelationships: m.relations.length ? m.relations.join(', ') : '(none)',
      BackendRefs: m.backendRefs,
      FrontendRefs: m.frontendRefs,
      Usage: m.status,
    })),
    ['Model', 'KeyRelationships', 'BackendRefs', 'FrontendRefs', 'Usage']
  ));
  md.push('');

  md.push('## 5) Cross-Component / Cross-Module Dependencies');
  md.push('');
  md.push('### 5.1 Page -> Backend Module Dependency (inferred from API calls)');
  md.push('');
  md.push(toMarkdownTable(
    pageDependencies
      .sort((a, b) => a.route.localeCompare(b.route))
      .map(p => ({
        Route: p.route,
        Modules: p.modules.length ? p.modules.join(', ') : '(none detected)',
        EndpointCount: p.endpointCount,
        Status: p.status,
      })),
    ['Route', 'Modules', 'EndpointCount', 'Status']
  ));
  md.push('');

  md.push('### 5.2 Top Module Reach Across Owner Pages');
  md.push('');
  md.push(toMarkdownTable(
    topModuleUsage.map(x => ({ Module: x.module, PageCount: x.pageCount })),
    ['Module', 'PageCount']
  ));
  md.push('');

  md.push('### 5.3 Known High-Value Flow Chains');
  md.push('');
  md.push('- Sales Payments -> Banking Deposits -> GL Journal Entries (AR module + Banking module + SubLedger/Accounting integration).');
  md.push('- Sales Invoices/Collections -> AR activity and audit feeds -> Integrations audit-log endpoint usage.');
  md.push('- AP Bills/Payments -> Expense module -> Accounting/GL posting dependencies.');
  md.push('- Onboarding -> Workspace/Company creation -> COA seed -> optional bank account provisioning.');
  md.push('');

  md.push('## 6) Seed Data Dependency Scan (enhanced)');
  md.push('');
  if (artifacts.seedGaps.length) {
    md.push(`- Total inferred seed gaps: ${artifacts.seedGaps.length}`);
    md.push(toMarkdownTable(
      artifacts.seedGaps.map(g => ({
        Category: g.category,
        Source: g.component,
        EndpointOrField: g.endpoint || g.indicator,
        ExpectedModel: g.expectedModel,
        Seeded: String(g.seeded),
      })),
      ['Category', 'Source', 'EndpointOrField', 'ExpectedModel', 'Seeded']
    ));
  } else {
    md.push('- No missing seed dependencies were detected by the enhanced scanner checks.');
  }
  md.push('');

  const MAX_SEED_DETAIL_ROWS = 220;
  md.push('### 6.1 Dropdown/List Endpoint Dependencies');
  md.push('');
  if (artifacts.dropdownDependencies.length) {
    md.push(`- Count: ${artifacts.dropdownDependencies.length}`);
    md.push(toMarkdownTable(
      artifacts.dropdownDependencies
        .slice(0, MAX_SEED_DETAIL_ROWS)
        .map(d => ({
          Component: d.component,
          Endpoint: d.endpoint,
          ExpectedModel: d.expectedModel,
          Seeded: String(d.seeded),
        })),
      ['Component', 'Endpoint', 'ExpectedModel', 'Seeded']
    ));
    if (artifacts.dropdownDependencies.length > MAX_SEED_DETAIL_ROWS) {
      md.push(`- Showing first ${MAX_SEED_DETAIL_ROWS} rows; see JSON artifact for complete detail.`);
    }
  } else {
    md.push('- No dropdown/list endpoint dependencies detected.');
  }
  md.push('');

  md.push('### 6.2 FK Field Dependencies in Forms');
  md.push('');
  if (artifacts.fkDependencies.length) {
    md.push(`- Count: ${artifacts.fkDependencies.length}`);
    md.push(toMarkdownTable(
      artifacts.fkDependencies
        .slice(0, MAX_SEED_DETAIL_ROWS)
        .map(d => ({
          Component: d.component,
          FKField: d.field,
          ExpectedModel: d.expectedModel,
          Seeded: String(d.seeded),
        })),
      ['Component', 'FKField', 'ExpectedModel', 'Seeded']
    ));
    if (artifacts.fkDependencies.length > MAX_SEED_DETAIL_ROWS) {
      md.push(`- Showing first ${MAX_SEED_DETAIL_ROWS} rows; see JSON artifact for complete detail.`);
    }
  } else {
    md.push('- No FK-form dependencies detected.');
  }
  md.push('');

  md.push('### 6.3 Expected GL Account Constants (Name/Code)');
  md.push('');
  if (artifacts.expectedAccountDependencies.length) {
    md.push(`- Count: ${artifacts.expectedAccountDependencies.length}`);
    md.push(toMarkdownTable(
      artifacts.expectedAccountDependencies
        .slice(0, MAX_SEED_DETAIL_ROWS)
        .map(d => ({
          SourceFile: d.sourceFile,
          IndicatorType: d.indicatorType,
          Indicator: d.indicator,
          Seeded: String(d.seeded),
        })),
      ['SourceFile', 'IndicatorType', 'Indicator', 'Seeded']
    ));
    if (artifacts.expectedAccountDependencies.length > MAX_SEED_DETAIL_ROWS) {
      md.push(`- Showing first ${MAX_SEED_DETAIL_ROWS} rows; see JSON artifact for complete detail.`);
    }
  } else {
    md.push('- No GL account constants detected in backend code scan.');
  }
  md.push('');

  md.push('### Additional Seed Risk Notes');
  md.push('');
  md.push('- Seed script logs non-fatal legacy-schema warnings; some relational links can remain missing in partially migrated local DBs.');
  md.push('- Many Owner pages are UI-only or placeholder and may need manual data setup before meaningful testing.');
  md.push('- If workspace/company currency is blank in demo company rows, account currency falls back to workspace base currency or USD.');
  md.push('');

  md.push('## 7) Missing Pieces / Mismatch Scan');
  md.push('');
  md.push('### 7.1 Frontend endpoint patterns without backend route match (inferred)');
  md.push('');
  const MAX_UNMATCHED_FRONTEND = 180;
  if (unmatchedFrontend.length) {
    md.push(`- Count: ${unmatchedFrontend.length}`);
    md.push(`- Showing first ${Math.min(unmatchedFrontend.length, MAX_UNMATCHED_FRONTEND)} patterns (see JSON artifact for full set).`);
    md.push('');
    md.push(unmatchedFrontend.slice(0, MAX_UNMATCHED_FRONTEND).map(x => `- ${x}`).join('\n'));
  } else {
    md.push('- None detected in the inferred static scan.');
  }
  md.push('');

  md.push('### 7.2 Unused Backend Routes Triaged by Module');
  md.push('');
  if (artifacts.unmatchedBackendByModule.length) {
    md.push(`- Total unused backend route patterns: ${artifacts.unmatchedBackendEndpoints.length}`);
    md.push(`- Classified as Backend-only: ${backendOnlyRouteCount}`);
    md.push(`- Classified as Missing UI: ${missingUiRouteCount}`);
    md.push('');
    md.push(toMarkdownTable(
      artifacts.unmatchedBackendByModule.map(group => ({
        Module: group.moduleName,
        Total: group.total,
        BackendOnly: group.backendOnly,
        MissingUI: group.missingUi,
      })),
      ['Module', 'Total', 'BackendOnly', 'MissingUI']
    ));
  } else {
    md.push('- No unmatched backend route patterns detected.');
  }
  md.push('');

  md.push('### 7.3 Route-Level Triage (Grouped)');
  md.push('');
  if (artifacts.unmatchedBackendByModule.length) {
    for (const group of artifacts.unmatchedBackendByModule) {
      md.push(`#### Module: ${group.moduleName}`);
      md.push('');
      md.push(toMarkdownTable(
        group.routes.map(route => ({
          Path: route.path,
          Methods: route.methods.length ? route.methods.join(', ') : '(unknown)',
          Classification: route.classification,
          Reason: route.reason,
        })),
        ['Path', 'Methods', 'Classification', 'Reason']
      ));
      md.push('');
    }
  } else {
    md.push('- No route-level triage rows available.');
    md.push('');
  }

  md.push('## Top Gaps / Gotchas Summary');
  md.push('');
  md.push('- Owner hub surface area is very large (200+ pages); many are wrappers/placeholders, so ticket-level work can miss prerequisite setup assumptions.');
  md.push('- Banking deposit flow depends on seeded/default bank accounts; without this, dropdowns are empty and flow appears broken.');
  md.push('- GL posting paths rely on specific system COA codes (e.g., 1010/1050/1100), so seed consistency is critical for end-to-end behavior.');
  md.push(`- Endpoint-to-UI coverage is uneven: ${missingUiRouteCount} unmatched backend routes look owner-relevant (Missing UI), while ${backendOnlyRouteCount} appear intentionally backend-only.`);
  md.push('');

  fs.writeFileSync(path.join(outDir, 'OwnerHub-System-Map.md'), md.join('\n'));

  console.log('Owner Hub system map generated.');
  console.log('Artifacts:');
  console.log('-', rel(path.join(outDir, 'OwnerHub-System-Map.md')));
  console.log('-', rel(path.join(outDir, 'owner-hub-map.json')));
}

main();
