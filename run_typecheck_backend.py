import subprocess, os
backend = r'C:\Users\HomePC\Desktop\Haypbooksv9\Haypbooks\Backend'
result = subprocess.run(['npm', 'run', 'typecheck'], cwd=backend, text=True, capture_output=True)
print('rc', result.returncode)
print('stdout:\n', result.stdout)
print('stderr:\n', result.stderr)
