# NavigaDER

The front-end of the BEO project.

## Set Up
Clone the repository and install dependencies:

```bash
git clone https://github.com/TerraVerdeRenewablePartners/navigader
cd navigader
npm run install
```

Building the application requires a `.env` file to specify certain environment variables:

- `REACT_APP_ENV`: a simple representation of the current environment. Typicall `prod` or
 `staging` or `local` 
- `REACT_APP_BEO_HOST`: the hostname of the server where the `beo_datastore` backend that will be
 serving data to the front end. This should omit a trailing `/`.

Full example:

```
REACT_APP_ENV=local
REACT_APP_BEO_HOST=localhost:8000
```

## Deployment
There are scripts contained in the `/scripts` directory for handling deployment to various
 environments. You will need the AWS CLI, which entails [installing](http://docs.aws.amazon.com/cli/latest/userguide/installing.html)
 the CLI, creating a user in AWS with the proper security credentials for writing to the bucket, and
 configuring the CLI with `aws configure`.
 
 Once set up with the CLI, you can deploy by simply calling the proper script:
 
 ```bash
./scripts/deploy-staging.sh
 ```

## Available Scripts

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).
In the project directory, you can run:

### `npm start`

Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.<br />
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.<br />
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br />
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (Webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
