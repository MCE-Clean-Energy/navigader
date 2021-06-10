#!/usr/bin/env zsh

if [[ "$1" =~ ^(dev|staging|prod)$ ]]; then
  environment=$1
else
    echo "Usage: deploy.sh (dev|staging|prod)"
    exit 1
fi

# Set up environment variables, S3 URI, CloudFront ID
case $environment in
  dev)
    export REACT_APP_ENV=dev;
    export REACT_APP_BEO_URI=https://api-dev.navigader.com;
    s3_uri=s3://dev.navigader.com
    cf_id=$DEV_CLOUDFRONT_ID;
    ;;
  staging)
    export REACT_APP_ENV=staging;
    export REACT_APP_BEO_URI=https://api-staging.navigader.com;
    s3_uri=s3://staging.navigader.com;
    cf_id=$STAGING_CLOUDFRONT_ID;
    ;;
  prod)
    export REACT_APP_ENV=prod;
    export REACT_APP_BEO_URI=https://api.navigader.com;
    s3_uri=s3://www.navigader.com
    cf_id=$PROD_CLOUDFRONT_ID;
    ;;
esac


# Run the build
echo 'Running CRA build...';
npm run build;

# Sync to S3
printf '\n\n';
echo "Deploying to S3 ($s3_uri)..."
aws s3 sync ../build/ $s3_uri

# Invalidate CloudFront cache
printf '\n\n';
if [[ $cf_id ]]; then
  echo 'Invalidating CloudFront cache';
  aws cloudfront create-invalidation --distribution-id "$cf_id" --paths "/*"
else
  echo 'WARNING: could not invalidate the CloudFront cache! Expected environment variable to be
  set. The S3 bucket has been updated, but the cache may still be active.';
fi

# Tag the commit
zsh ./scripts/tag-commit.sh "$environment";
