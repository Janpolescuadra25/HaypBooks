import re
import subprocess
from pathlib import Path
root = Path('Haypbooks/Frontend/src')
changed = subprocess.check_output(['git','diff','--name-only','--', str(root)], shell=False).decode('utf-8').splitlines()
use_re = re.compile(r"('use client'|\"use client\")")
hook_re = re.compile(r"\b(useState|useEffect|useReducer|useCallback|useMemo|useRef|useContext|useLayoutEffect|useImperativeHandle|useTransition|useDeferredValue|useId|useSyncExternalStore|useOptimistic|useActionState)\b")
event_re = re.compile(r"on(?:Click|Change|Submit|MouseEnter|MouseLeave|KeyDown|KeyUp|Focus|Blur|Input|Drag|Drop|TouchStart|TouchEnd|PointerDown|PointerUp|Scroll|Wheel)\s*=")
browser_re = re.compile(r"\b(window|document|localStorage|sessionStorage|navigator|location|history|fetch|XMLHttpRequest)\b")
client_lib_re = re.compile(r"from\s+['\"](?:next/navigation|react-dom|motion/react|react-hot-toast|@headlessui/react|@radix-ui/react|lucide-react|react-router|react-query|swr|zustand|jotai|react-redux|@tanstack/react-query)['\"]")
custom_hook_re = re.compile(r"import\s+\{?\s*(use[A-Z][A-Za-z0-9_]*)\s*\}?\s+from\s+['\"][^'\"]*(hooks|hook)[^'\"]*['\"]")
jsx_re = re.compile(r"<\w")
print('file,use_client_count,hook_import,use_hook,event_handler,browser_global,client_lib,custom_hook,jsx')
for f in sorted(changed):
    p = Path(f)
    if not p.exists():
        continue
    text = p.read_text(encoding='utf-8')
    count = len(use_re.findall(text))
    if count == 0:
        continue
    hook = bool(hook_re.search(text))
    event = bool(event_re.search(text))
    browser = bool(browser_re.search(text))
    lib = bool(client_lib_re.search(text))
    custom = bool(custom_hook_re.search(text))
    jsx = bool(jsx_re.search(text))
    print(f'{f},{count},{hook},{event},{browser},{lib},{custom},{jsx}')
