import sys
sys.path.insert(0, '/app')

from app.main import app

# List all routes
print("="*80)
print("ALL REGISTERED ROUTES:")
print("="*80)
for route in app.routes:
    if hasattr(route, 'path') and hasattr(route, 'methods'):
        print(f"{route.methods} {route.path}")
print("="*80)

# Check if our route is there
target_path = "/agendamento-online/gerar-link/{cliente_id}"
found = False
for route in app.routes:
    if hasattr(route, 'path') and route.path == target_path:
        found = True
        print(f"✓ FOUND: {route.path} - Methods: {route.methods}")
        break

if not found:
    print(f"✗ NOT FOUND: {target_path}")
