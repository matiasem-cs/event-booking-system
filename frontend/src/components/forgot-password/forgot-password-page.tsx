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
import { useState } from 'react';
import { AuthApi } from '../../api/authApi';
import { ErrorMessage } from '../error/error';
import {SuccessMessage} from '../success/success';
import { Loader } from '../loader/loader';
import { APIStatus, PageProps } from '../../types';

const defaultTheme = createTheme();

export const ForgotPasswordPage: React.FC<PageProps> = ({
    navigateToLoginPage
}) => {
  const [username, setUsername] = useState<string>('');
  const [securityQuestion, setSecurityQuestion] = useState<string>('');
  const [answer, setAnswer] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>('');

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    try {
        // console.log('handelSubmit', username);
      // Fetch security question based on username
        const response = await AuthApi.getSecurityQuestion(username);
        if (typeof response === 'string'){
            // console.log('response', response);
            // Handle the case where response is a string (security question)
            setSecurityQuestion(response);
        } else {
            // Handle the case where response is not a string (APIStatus)
            if (response === APIStatus.Unauthorized) {
                // Redirect to login page
            } else {
                setErrorMessage('Failed to retrieve security question');
                setSuccessMessage('');
            }
        }
    } catch (error) {
        setErrorMessage('Failed to retrieve security question');
        setSuccessMessage('');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAnswer(e.target.value);
  };

  const handleNewPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewPassword(e.target.value);
  };

  const handleLogin = () => {
    navigateToLoginPage();
  };

  const handleResetPassword = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    if (newPassword.length === 0 || answer.length === 0) {
      setErrorMessage('Answer and New Password are required');
      setSuccessMessage('');
      setIsLoading(false);
      return;
    }
    try {
      // Validate answer and set new password
      const res = await AuthApi.resetPassword({ username, password: newPassword, secAnswer: answer});

        if (res === APIStatus.Success) {
            setSuccessMessage('Password reset successful');
            setErrorMessage('');
            // // Redirect to login page
            // navigateToLoginPage();
        } else {
            // console.log('in handleResetPassword res: ', res);
            setErrorMessage('Failed to reset password');
            setSuccessMessage('');
        }
      // Redirect to login page after password reset
      // You can use a navigation library like react-router-dom for this
    } catch (error) {
        // console.log('in handleResetPassword error: ', error);
        setErrorMessage('Failed to reset password');
        setSuccessMessage('');
    } finally {
      setIsLoading(false);
    }
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
            Forgot Password
          </Typography>
          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="Username"
              name="username"
              autoComplete="username"
              onChange={handleUsernameChange}
              autoFocus
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Get Security Question
            </Button>
          </Box>
          {securityQuestion && (
            <Box component="form" onSubmit={handleResetPassword} noValidate sx={{ mt: 1 }}>
              <Typography><strong>Security Question: </strong>{securityQuestion}</Typography>
              <TextField
                margin="normal"
                required
                fullWidth
                id="answer"
                label="Answer"
                name="answer"
                autoComplete="answer"
                onChange={handleAnswerChange}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="newPassword"
                label="New Password"
                type="password"
                id="newPassword"
                autoComplete="new-password"
                onChange={handleNewPasswordChange}
              />
              {errorMessage && <ErrorMessage message={errorMessage}/>}
              {successMessage && <SuccessMessage message={successMessage}/>}
              {isLoading ? <Loader /> :
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
              >
                Reset Password
              </Button>
              }
            </Box>
          )}
          <Grid container>
            <Grid item xs>
              <Link href="#" variant="body2" onClick={handleLogin}>
                Back to Login
              </Link>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </ThemeProvider>
  );
};
