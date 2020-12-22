# NavigaDER

The front-end of the BEO project.

## Set Up

Installing the application requires Node.js version 14. We strongly recommend using a Node version
manager like [nvm](https://github.com/nvm-sh/nvm) or [n](https://github.com/tj/n) to install Node.js
and npm. Instructions for doing so can be found [here](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm#using-a-node-version-manager-to-install-nodejs-and-npm).

Clone the repository and install dependencies:

```bash
git clone https://github.com/TerraVerdeRenewablePartners/navigader
cd navigader
npm install
```

Building the application requires a `.env` file to specify certain environment variables:

- `REACT_APP_BEO_URI`: _Required_. The URI where the backend of the BEO application is hosted. This
  is automatically set in the deployment script. This should omit a trailing `/`.
- `REACT_APP_SUPPORT_EMAIL`: _Strongly recommended_. The email address where users will be directed
  to send support messages. If this is excluded, the "Submit Feedback" icon in the application
  header will not be rendered.
- `REACT_APP_ENV`: _Optional_. The environment of the NavigaDER deployment. Typically this will be
  one of `prod`, `staging` or `local`. This is automatically set in the deployment script.
- `REACT_APP_HELP_PAGE_URI`: _Optional_. The URI where the User Manual/help page is hosted. If
  omitted, the "Help" button in the application header will not render.

Full example:

```
REACT_APP_BEO_URI=https://api.navigader.com
REACT_APP_SUPPORT_EMAIL=support@navigader.com
REACT_APP_ENV=local
REACT_APP_HELP_PAGE_URI=https://navigader.com/user-manual
```

You can confirm if the installation worked successfully by running `npm start`. This will launch the
WebPack server and serve the NavigaDER front end (by default on port 3000). If you encounter an
error, please confirm that your Node version is correct and that there were no warnings/errors in
the install process.

## Deployment

There is a script contained in the `/scripts` directory for handling deployment to various
environments. You will need the AWS CLI, which entails [installing](http://docs.aws.amazon.com/cli/latest/userguide/installing.html)
the CLI, creating a user in AWS with the proper security credentials for writing to the bucket, and
configuring the CLI with `aws configure`.

Once set up with the CLI, you can deploy by calling the script with one of three environment labels:

```bash
./scripts/deploy.sh dev         # deploys to the development environment
./scripts/deploy.sh staging     # deploys to the staging environment
./scripts/deploy.sh prod        # deploys to the production environment
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
