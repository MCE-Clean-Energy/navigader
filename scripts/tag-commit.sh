#!/usr/bin/env zsh

export TAG_NAME="deployed-to-$1";
git tag -d "$TAG_NAME";
git push origin --delete "$TAG_NAME";
git tag -a "$TAG_NAME" -m "This commit has been deployed to the $1 environment";
git push origin --tags;
