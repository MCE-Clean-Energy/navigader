# Set up environment variables
export REACT_APP_BEO_URI=https://api.navigader.com;

# Run the build
echo 'Running CRA build...';
npm run build;

# Sync to S3
printf '\n\n';
echo 'Deploying to S3...'
aws s3 sync build/ s3://navigader.com
