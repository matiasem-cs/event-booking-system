// import React, { useEffect, useState } from 'react';
// import './main-page.css'; 
// import { AuthApi } from '../../api/authApi';
// import { Loader } from '../loader/loader';
// import { APIStatus, PageProps } from '../../types';
// import { ErrorMessage } from '../error/error';

// export const MainPage: React.FC<PageProps> = ({navigateToSignInPage}) => {
//   const [username, setUsername] = useState<string>('');
//   const [isLoading, setIsLoading] = useState<boolean>(true);
//   const [errorMessage, setErrorMessage] = useState<string>('');

//   // TODO: get the user name from AuthApi and update the state
//   // TODO: handle different APIStatus and navigate to the right page

//   useEffect(() => {
//     const fetchUserName = async () => {
//       try {
//         const result = await AuthApi.getUserName();
//         if (typeof result === 'string') {
//           setUsername(result);
//         } else {
//           // Handle the case where result is not a string (APIStatus)
//           handleApiStatus(result);
//         }
//       } catch (error) {
//         // Handle any errors that occur during the fetch
//         setErrorMessage('Failed to fetch user name, please try again');
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchUserName();
//   }, []); 

//   const handleApiStatus = (result: APIStatus) =>{
//     if (result === APIStatus.Unauthorized) {
//       navigateToSignInPage();
//     } else {
//       setErrorMessage('Failed to fetch user name, please try again');
//     }
//   }

//   const onLogout = async () => {
//     setIsLoading(true);
//     const res = await AuthApi.logout();
//     setIsLoading(false);
//     if(res === APIStatus.Success) {
//         navigateToSignInPage();
//         return;
//     }
//     setErrorMessage('Failed to logout, please try again');
//   }

//   return (
//     <div className="main-page-container">
//       {isLoading 
//       ? <Loader /> 
//       : <> 
//         <h2>Hello, {username}</h2>
//         <button onClick={onLogout}>Logout</button> 
//       </>
//       }
//     {errorMessage && <ErrorMessage message={errorMessage}/>}
//     </div>
//   );
// };
