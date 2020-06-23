#!/usr/bin/env zsh

if [[ "$1" =~ ^(dev|staging|prod)$ ]]; then
  environment=$1
else
    echo "Usage: tag-commit.sh (dev|staging|prod)"
    exit 1
fi

export TAG_NAME="deployed-to-$environment";
git tag -d "$TAG_NAME";
git push origin --delete "$TAG_NAME";
git tag -a "$TAG_NAME" -m "This commit has been deployed to the $environment environment";
git push origin --tags;
