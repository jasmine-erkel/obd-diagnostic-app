#!/bin/bash

# One-time setup script for developer environment
# This sets up the auto-signing configuration

echo "🚀 Setting up iOS development environment..."
echo ""

# Get git email to identify developer
GIT_EMAIL=$(git config user.email 2>/dev/null || echo "")
USERNAME=$(whoami)

echo "Detected:"
echo "  Git email: $GIT_EMAIL"
echo "  Username: $USERNAME"
echo ""

# Run the auto-configure script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
"$SCRIPT_DIR/auto-configure-signing.sh"

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "  1. Run 'npx pod-install' (if you haven't already)"
echo "  2. Open OBDDiagnosticApp.xcworkspace in Xcode"
echo "  3. Build and run (Cmd+R)"
echo ""
echo "The project will automatically use your team settings each time you build."
