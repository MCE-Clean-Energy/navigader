#!/usr/bin/env zsh

if [[ "$1" =~ ^(dev|staging|prod)$ ]]; then
  environment=$1
else
    echo "Usage: tag-commit.sh (dev|staging|prod)"
    exit 1
fi

cur_date=$(date -u +%d.%m.%y-%H:%M);
export TAG_NAME="deployed-to-$environment""__$cur_date";
git tag -a "$TAG_NAME" -m "This commit has been deployed to the $environment environment";
git push origin --tags;
