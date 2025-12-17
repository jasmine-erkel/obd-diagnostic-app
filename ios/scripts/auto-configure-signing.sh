#!/bin/bash

# Auto-configure iOS code signing based on developer
# This script automatically detects who is building and applies the correct team settings

set -e

# Determine project root
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
IOS_DIR="$(dirname "$SCRIPT_DIR")"
PROJECT_FILE="${IOS_DIR}/OBDDiagnosticApp.xcodeproj/project.pbxproj"

# Detect developer based on git config email
GIT_EMAIL=$(git config user.email 2>/dev/null || echo "")

# Default settings
TEAM_ID=""
BUNDLE_ID="com.jasmineerkel.obddiagnosticapp"

# Determine which developer based on git email
if [[ "$GIT_EMAIL" == *"jasmine"* ]] || [[ "$GIT_EMAIL" == *"jasmineerkel"* ]]; then
    echo "🔧 Detected: Jasmine - Configuring with Jasmine's team..."
    TEAM_ID="8U6N58MTLU"
elif [[ "$GIT_EMAIL" == *"joshua"* ]] || [[ "$GIT_EMAIL" == *"joshuaerkel"* ]]; then
    echo "🔧 Detected: Joshua - Configuring with Joshua's team..."
    TEAM_ID="MC3KGY63CP"
else
    # Fallback: try to detect by username
    USERNAME=$(whoami)
    if [[ "$USERNAME" == "jasmineerkel" ]]; then
        echo "🔧 Detected: Jasmine (by username) - Configuring with Jasmine's team..."
        TEAM_ID="8U6N58MTLU"
    elif [[ "$USERNAME" == *"joshua"* ]]; then
        echo "🔧 Detected: Joshua (by username) - Configuring with Joshua's team..."
        TEAM_ID="MC3KGY63CP"
    else
        echo "⚠️  Warning: Could not auto-detect developer."
        echo "   Git email: $GIT_EMAIL"
        echo "   Username: $USERNAME"
        echo "   Using empty team ID - Xcode will prompt you to select a team."
        TEAM_ID=""
    fi
fi

# Update the project file with the detected team
if [ -f "$PROJECT_FILE" ]; then
    # Create a temporary file for sed operations
    TEMP_FILE="${PROJECT_FILE}.tmp"

    # Replace DEVELOPMENT_TEAM in Debug configuration
    sed "s/DEVELOPMENT_TEAM = \"[^\"]*\";/DEVELOPMENT_TEAM = \"$TEAM_ID\";/g" "$PROJECT_FILE" > "$TEMP_FILE"

    # Only update if sed succeeded
    if [ $? -eq 0 ]; then
        mv "$TEMP_FILE" "$PROJECT_FILE"
        echo "✅ Auto-configured signing for $GIT_EMAIL with team: $TEAM_ID"
    else
        echo "❌ Failed to update project file"
        rm -f "$TEMP_FILE"
        exit 1
    fi
else
    echo "❌ Project file not found at: $PROJECT_FILE"
    exit 1
fi
