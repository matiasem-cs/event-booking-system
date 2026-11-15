import { LoginPage } from './components/login/mui-login-page.tsx';
import {SignUpPage} from './components/signup/mui-signup-page';
import {ForgotPasswordPage} from './components/forgot-password/forgot-password-page';
import {PageProps, Pages} from './types';
import {useState} from 'react';
import {AuthLayout} from "./pages/authLayout/AuthLayout.tsx";

export const App = () => {
  const [currentPage, setCurrentPage] = useState<Pages>(Pages.LOGIN); // production: Pages.LOGIN
  // const [currentPage, setCurrentPage] = useState<Pages>(Pages.TESTING); // staging: Page.TESTING


  /* page navigation handlers */
  const navigateToSignUpPage = () => setCurrentPage(Pages.SIGNUP);
  const navigateToLoginPage = () => setCurrentPage(Pages.LOGIN);
  const navigateToAuthLayout = () => setCurrentPage(Pages.AUTHLAYOUT);
  const navigateToForgotPasswordPage = () => setCurrentPage(Pages.FORGOT_PASSWORD);



  /* Prop definitions */
  const pageProps: PageProps = {   // page navigation props
    navigateToSignUpPage,
    navigateToLoginPage,
    navigateToAuthLayout,
    navigateToForgotPasswordPage
  }


  if(currentPage === Pages.LOGIN) {
    return (
      <LoginPage {...pageProps}/>
    )
  }
  else if(currentPage === Pages.SIGNUP) {
    return (
      <SignUpPage {...pageProps}/>
    )
  } else if (currentPage === Pages.FORGOT_PASSWORD){
    return (
      <ForgotPasswordPage {...pageProps}/>
    )
  }
  else if(currentPage === Pages.AUTHLAYOUT){
    return (
      <AuthLayout {...pageProps}/>
    )
  } else {
    return (
      <>
        <h1>You are in Testing !</h1>
       <p><b>Currently under construction...</b></p>
      </>    
    )
  }
};
