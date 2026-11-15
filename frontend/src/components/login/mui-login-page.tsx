import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { APIStatus, PageProps } from '../../types';
import { useState } from 'react';
import { AuthApi } from '../../api/authApi';
import { ErrorMessage } from '../error/error';
import { Loader } from '../loader/loader';

// import { APIStatus, PageProps } from '../../types';

function Copyright(props: any) {
  return (
    <Typography variant="body2" color="text.secondary" align="center" {...props}>
      {'Copyright © '}
      <Link color="inherit" href="https://mui.com/">
        Your Website
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}

// TODO remove, this demo shouldn't need to reset the theme.
const defaultTheme = createTheme();

export const LoginPage: React.FC<PageProps> = ({  
    navigateToAuthLayout,
    navigateToSignUpPage,
    navigateToForgotPasswordPage
}) =>{

    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('' );
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setUsername(e.target.value);
    };
  
    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setPassword(e.target.value);
    };
  
    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        setUsername(data.get('username') as string);
        setPassword(data.get('password') as string);

        if(password.length === 0 || username.length === 0) {
            // console.log('length 0');
            setErrorMessage(LoginErrorMessages.required);
            return;
        }
        setIsLoading(true);
        const res = await AuthApi.login({ username, password });
        setIsLoading(false);
        
        if(res === APIStatus.Success) {
            // alert('Login successful');
            navigateToAuthLayout();
            return;
        }
        // TODO: handle other APIStatus - set proper error message (see LoginErrorMessages)
        if(res === APIStatus.Unauthorized ) {
            setErrorMessage(LoginErrorMessages.invalid);
            return;
        }
        if(res === APIStatus.BadRequest) {
            // console.log('BadRequest');
            setErrorMessage(LoginErrorMessages.required);
            return;
        }
        if(res === APIStatus.ServerError) {
            setErrorMessage(LoginErrorMessages.failed);
            return;
        }
    };

    const handleSignUp = () => {
        navigateToSignUpPage()
      };
    
    const handleForgotPassword = () => {
        navigateToForgotPasswordPage();
    }

  return (
    <ThemeProvider theme={defaultTheme}>
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <Box
          sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Login
          </Typography>
          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="User Name"
              name="username"
              autoComplete="username"
              onChange={handleUsernameChange}
              autoFocus
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              onChange={handlePasswordChange}
            />
            {/* <FormControlLabel
              control={<Checkbox value="remember" color="primary" />}
              label="Remember me"
            /> */}
            {errorMessage && <ErrorMessage message={errorMessage}/>}
            {isLoading ? <Loader /> :
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Sign In
            </Button>
            }
            <Grid container>
              <Grid item xs>
                <Link href="#" variant="body2" onClick={handleForgotPassword}>
                  Forgot password?
                </Link>
              </Grid>
              <Grid item>
                <Link href="#" variant="body2" onClick={handleSignUp}>
                  {"Don't have an account? Sign Up"}
                </Link>
              </Grid>
            </Grid>
          </Box>
        </Box>
        <Copyright sx={{ mt: 8, mb: 4 }} />
      </Container>
    </ThemeProvider>
  );
}


const LoginErrorMessages = {
    required: 'Username and password are required',
    invalid: 'Invalid username or password',
    failed: 'Login failed, please try again'
  };