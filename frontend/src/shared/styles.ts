import { createMuiTheme } from '@material-ui/core/styles';


export const primaryColor = '#EC0B88';
export const secondaryColor = '#F8B367';

const theme = createMuiTheme({
  palette: {
    primary: {
      main: primaryColor
    },
    secondary: {
      main: secondaryColor
    }
  }
});

export default theme;
