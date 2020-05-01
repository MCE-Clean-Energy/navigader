#!/usr/bin/env zsh

# Set up environment variables
export REACT_APP_ENV=prod;
export REACT_APP_BEO_HOST=api.navigader.com;

# Run the build
echo 'Running CRA build...';
npm run build;

# Sync to S3
printf '\n\n';
echo 'Deploying to S3...'
aws s3 sync build/ s3://navigader.com

# Invalidate CloudFront cache
printf '\n\n';
if [[ -v PROD_CLOUDFRONT_ID ]]; then
  echo 'Invalidating dev CloudFront cache';
  aws cloudfront create-invalidation --distribution-id $PROD_CLOUDFRONT_ID --paths "/*"
else
  echo 'WARNING: could not invalidate the CloudFront cache! Expected PROD_CLOUDFRONT_ID environment
  variable to be set. The S3 bucket has been updated, but the cache may still be active.';
fi

