import sys
import traceback

try:
    import app.main
    print("SUCCESS")
except Exception as e:
    print(traceback.format_exc())
