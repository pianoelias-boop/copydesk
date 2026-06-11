#!/bin/bash
# Double-click to start Copydesk (macOS). Opens your browser automatically.
cd "$(dirname "$0")"
echo "Starting Copydesk…"
python3 serve.py || {
  echo ""
  echo "Python 3 is required. macOS will offer to install it — accept, then double-click this file again."
  read -r -p "Press Enter to close."
}
