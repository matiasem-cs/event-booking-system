import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
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

export const SignUpPage: React.FC<PageProps> = ({
    navigateToLoginPage
}) => {
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [secQuestion, setSecQuestion] = useState<string>('');
    const [secAnswer, setSecAnswer] = useState<string>('');
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);



    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
      
      event.preventDefault();
      const data = new FormData(event.currentTarget);
      console.log({
          username: data.get('username'),
          password: data.get('password'),
          secQuestion: data.get('secQuestion'),
          secAnswer: data.get('secAnswer')
      });

      if(password.length === 0 || username.length === 0 || secQuestion.length === 0 || secAnswer.length === 0) {
          setErrorMessage(SignUpErrorMessages.required);
          return;
      }
      setIsLoading(true);
      const res = await AuthApi.signUp({ username, password , secQuestion, secAnswer});
      setIsLoading(false);

      if(res === APIStatus.Success) {
        navigateToLoginPage();
        return;
      }
      // TODO: handle other APIStatus - set proper error message (see SignUpErrorMessages)
      if(res === APIStatus.BadRequest) {
        setErrorMessage(SignUpErrorMessages.exists);
        return;
      } else {
        setErrorMessage(SignUpErrorMessages.failed);
      }

    };

    const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setUsername(e.target.value);
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setPassword(e.target.value);
    };

    const handleSecQuestionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setSecQuestion(e.target.value);
    };

    const handleSecAnswerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setSecAnswer(e.target.value);
    };

  const handleLogin = () => {
    navigateToLoginPage();
  };

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
            Sign up
          </Typography>
          <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  autoComplete="given-name"
                  name="username"
                  required
                  fullWidth
                  id="username"
                  label="User Name"
                  onChange={handleUsernameChange}
                  autoFocus
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type="password"
                  id="password"
                  onChange={handlePasswordChange}
                  autoComplete="new-password"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  id="secQuestion"
                  label="Security Question"
                  onChange={handleSecQuestionChange}
                  name="secQuestion"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  id="secAnswer"
                  label="Security Answer"
                  onChange={handleSecAnswerChange}
                  name="secAnswer"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={<Checkbox value="confirmSecAnswer" color="primary" />}
                  label="I am aware that I must remember the security answer for password reseting."
                />
              </Grid>
            </Grid>
            {errorMessage && <ErrorMessage message={errorMessage}/>}
            {isLoading ? <Loader /> :
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Sign Up
            </Button>}
            <Grid container justifyContent="flex-end">
              <Grid item>
                <Link href="#" variant="body2" onClick={handleLogin}>
                  Already have an account? Sign in
                </Link>
              </Grid>
            </Grid>
          </Box>
        </Box>
        <Copyright sx={{ mt: 5 }} />
      </Container>
    </ThemeProvider>
  );
}


const SignUpErrorMessages = {
    required: 'All fields are required',
    exists: 'Username already exists',
    failed: 'Sign Up failed, please try again'
};