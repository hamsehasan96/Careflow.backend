#!/bin/bash

echo "Checking for changes..."

# Check if there are any changes to commit
if [ -n "$(git status --porcelain)" ]; then
    echo "Changes detected. Adding files..."
    # Add all changes
    git add .
    
    echo "Committing changes..."
    # Commit with timestamp
    git commit -m "Update: $(date '+%Y-%m-%d %H:%M:%S')"
    
    echo "Pushing to main branch..."
    # Push to main
    git push origin main
    
    echo "✅ Changes pushed to main successfully!"
else
    echo "No changes to commit."
fi 