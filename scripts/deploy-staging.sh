#!/usr/bin/env zsh

# Set up environment variables
export REACT_APP_ENV=staging;
export REACT_APP_BEO_URI=https://api-staging.navigader.com;

# Run the build
echo 'Running CRA build...';
npm run build;

# Sync to S3
printf '\n\n';
echo 'Deploying to S3...'
aws s3 sync build/ s3://staging.navigader.com

# Invalidate CloudFront cache
printf '\n\n';
if [[ -v STAGING_CLOUDFRONT_ID ]]; then
  echo 'Invalidating dev CloudFront cache';
  aws cloudfront create-invalidation --distribution-id $STAGING_CLOUDFRONT_ID --paths "/*"
else
  echo 'WARNING: could not invalidate the CloudFront cache! Expected STAGING_CLOUDFRONT_ID environment
  variable to be set. The S3 bucket has been updated, but the cache may still be active.';
fi

# Tag the commit
zsh ./scripts/tag-commit.sh staging;
