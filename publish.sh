#!/bin/bash

# Ask for a commit message
echo "Enter a commit message:"
read msg

# Stage, commit, and push to GitHub
git add .
git commit -m "$msg"
git push

echo "Changes pushed to GitHub. Netlify will redeploy automatically."
