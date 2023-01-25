#!/usr/bin/env bash

if ! git status | grep "goldens/"; then
  echo "No Public API changes found! Exitting..."
  exit 0
fi


echo "Public API changes found!"

git status || exit 1

echo "Committing changes..."

git add goldens/* || exit 1
git commit -m "chore(api): changes of public api goldens" || exit 1

echo "Pushing changes"

git push -u origin HEAD || exit 1

echo "Done!"
