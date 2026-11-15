import { Request, Response } from 'express';
import jwt, { JwtPayload, Secret } from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import User from '../models/user';
import { UserPermission } from '../consts';

export async function adminLoginRoute(req: Request, res: Response) {
  const credentials = req.body;
  if (!credentials.username || !credentials.password) {
    res.status(400).send('Invalid credentials');
    return;
  }

  let user;
  
    try {
      user = await User.findOne({ username: credentials.username });
    }
    catch (e) {
      res.status(500).send('Internal server error');
      return;
    }

    if (!user || !await bcrypt.compare(credentials.password, user.password)) {
      res.status(401).send('Invalid credentials');
      return;
    }

    if (user.permission !== UserPermission.Admin) {
      res.status(403).send('Permission denied');
      return;
    }
  
    const token = jwt.sign({ user_id: user._id, permission: user.permission, username: user.username }, process.env.JWT_SECRET as Secret, { expiresIn: '2d' })
    res.status(200).send({ token });

}

export async function loginRoute(req: Request, res: Response) {
    const credentials = req.body;
    if (!credentials.username || !credentials.password) {
      res.status(400).send('Invalid credentials');
      return;
    }
  
    let user;
  
    try {
      user = await User.findOne({ username: credentials.username });
    }
    catch (e) {
      res.status(500).send('Internal server error');
      return;
    }
  
    if (!user || !await bcrypt.compare(credentials.password, user.password)) {
      res.status(401).send('Invalid credentials');
      return;
    }
  
    const token = jwt.sign({ user_id: user._id, permission: user.permission, username: user.username }, process.env.JWT_SECRET as Secret, { expiresIn: '2d' })
  
    const secure = process.env.NODE_ENV === 'production';
    res.cookie('token', token, { secure, httpOnly: true, sameSite: 'none' }); // production
    // res.cookie('token', token, { httpOnly: false, path: '/', secure: false, sameSite: 'lax'}); // staging
    res.status(200).send('Logged in');
}
  
export async function logoutRoute(req: Request, res: Response) {
    const secure = process.env.NODE_ENV === 'production';
    /* TODO: clear the token cookie */
    res.clearCookie('token',{ secure, httpOnly: true, sameSite: 'none' }); // production
    // res.clearCookie('token', { httpOnly: false, path: '/', secure: false, sameSite: 'lax' }); // staging
    res.status(200).send('Logged out');
    /* ========== */
}
  
export async function signupRoute(req: Request, res: Response) {
    const user = new User(req.body);
    try {
      await user.validate();
    }
    catch (e) {
      res.status(400).send('Invalid credentials');
      return;
    }
    if (await User.exists({ username: user.username })) {
      res.status(400).send('Username already exists');
      return;
    }
  
    user.password = await bcrypt.hash(user.password, 10);
  
    try {
      await user.save();
    }
    catch (e) {
      res.status(500).send('Error creating user');
      return;
    }
  
    res.status(201).send('User created');
}
  
export async function usernameRoute(req: Request, res: Response) {
    const token = req.cookies.token;
    if (!token) {
      res.status(401).send('Not logged in');
      return;
    }
  
    let username;
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET as Secret);
      username = (payload as JwtPayload).username;
    }
    catch (e) {
      res.status(401).send('Invalid token');
      return;
    }
  
    res.status(200).send({username});
}

export async function getUserPermission(req: Request, res: Response) {
    const token = req.cookies.token;
    if (!token) {
      res.status(401).send('Not logged in');
      return;
    }
  
    let permission;
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET as Secret);
      permission = (payload as JwtPayload).permission;
    }
    catch (e) {
      res.status(401).send('Invalid token');
      return;
    }
  
    res.status(200).send({permission});
}


// update user permission
export async function updateUserPermission(req: Request, res: Response) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    res.status(401).send('Not logged in');
    return;
  }

  let permission;
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET as Secret);
    permission = (payload as JwtPayload).permission;
  }
  catch (e) {
    res.status(401).send('Invalid token');
    return;
  }

  if (permission !== UserPermission.Admin) {
    res.status(403).send('Permission denied, only admins can update permissions');
    return;
  }
    if (permission !== UserPermission.Admin) {
      res.status(403).send('Permission denied, only admins can update permissions');
      return;
    }
  
    const id = req.params.id;
    const newPermission = req.body.permission;
    const user = await User.findOne({ _id: id});
    if (!user) {
      res.status(404).send('User not found');
      return;
    }
    if (!newPermission) {
      res.status(400).send('Permission not provided');
      return;
    }

    if (newPermission === UserPermission.Admin) {
      res.status(400).send('Cannot set permission to admin');
      return;
    }

    try {
      await User.updateOne({ _id: id }, { permission: newPermission });
    }
    catch (e) {
      res.status(500).send('Internal server error');
      return;
    }
  
    res.status(200).send('Permission updated');
}

// forgot password, if user exists return security question
export async function forgotPasswordRoute(req: Request, res: Response) {
    const username = req.params.username;
    console.log('gateway forgotPasswordRoute username:', username);
    const user = await User.findOne({ username: username });
    if (!user) {
      res.status(404).send('User not found');
      return;
    }
    res.status(200).send(user.secQuestion);
}

// reset password
export const resetPassword = async (req: Request, res: Response) => {
  const username = req.params.username;
  const { securityAnswer, newPassword } = req.body;

  try {
      // Find the user by username or email
      const user = await User.findOne({ username: username });
      
      if (!user) {
          return res.status(404).json({ message: 'User not found' });
      }

      // Verify the security answer
      if (user.secAnswer !== securityAnswer) {
          return res.status(401).json({ message: 'Invalid security answer' });
      }

      const userToValidate = new User(user);
      userToValidate.password = newPassword;
      try {
          await userToValidate.validate();
      } catch (error) {
          return res.status(400).json({ message: 'Invalid password' });
      }
      // Update the user's password
      user.password = await bcrypt.hash(newPassword, 10);
      await user.save();

      // Send the token to the client
      res.status(200).json({ message: 'Password reset successful'});
  } catch (error) {
      res.status(500).json({ message: error.message });
  }
};

// get user info by id
export async function getUserInfo(req: Request, res: Response) {
  const token = req.cookies.token;
  if (!token) {
    res.status(401).send('Not logged in');
    return;
  }  
  let user_id;

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET as Secret);
    user_id = (payload as JwtPayload).user_id;
  }
  catch (e) {
    res.status(401).send('Invalid token');
    return;
  }
  const user = await User.findOne({ _id: user_id});
  if (!user) {
    res.status(404).send('User not found');
    return;
  }
  const userInfo = {
    user_id: user._id,
    username: user.username,
    permission: user.permission,
    rating_counter: user.ratingCounter,
    closest_event_name: user.closestEventName,
    closest_event_date: user.closestEventDate
  }
  res.status(200).send(userInfo);
}

// get user info by id
export async function getUserInfoById(req: Request, res: Response) {
  const id = req.params.id;
  const user = await User.findOne({ _id: id});
  if (!user) {
    res.status(404).send('User not found');
    return;
  }
  const userInfo = {
    user_id: user._id,
    username: user.username,
    rating_counter: user.ratingCounter,
    closest_event_name: user.closestEventName,
    closest_event_date: user.closestEventDate
  }
  res.status(200).send(userInfo);
}


export const increaseUserRatingCounter = async (data: any) => {
  try {
    console.log('increaseUserRatingCounter data:', data);
    const user = await User.findOne({ _id: data.user_id });
    if (!user) {
      console.error('User not found in increaseUserRatingCounter');
      return;
    }
    user.ratingCounter += 1;
    await user.save();
  } catch (error) {
    console.error('Error in increaseUserRatingCounter:', error);}
}


// {
//   user_id: userId,
//   closest_event: {
//     event_id: closestEvent.event_id,
//     title: closestEvent.event_details.title,
//     start_date: closestEvent.event_details.start_date
//  }
// }

export const updateAllUsersClosestEvent = async (data: any) => {
  data.forEach(async (user: any) => {
    try {
      const userToUpdate = await User.findOne({ _id: user.user_id });
      if (!userToUpdate) {
        console.error('User not found in updateUsersClosestEvent id:', user.user_id);
        return;
      }
      userToUpdate.closestEventName = user.closest_event.title;
      userToUpdate.closestEventDate = user.closest_event.start_date;
      await userToUpdate.save();
    } catch (error) {
      console.error('Error in updateUsersClosestEvent:', error);
    }
  });
}




// const orderedEventDetails = {
//   user_id: order.user_id,
//   event_id: eventInfo.event_id,
//   eventName: eventInfo.name,
//   start_date: eventInfo.start_date,
// }
export const updateSingleUserClosetEvent = async (data: any) => {
  try {
    const userToUpdate = await User.findOne({ _id: data.user_id });
    if (!userToUpdate) {
      console.error('User not found in updateUsersClosestEvent id:', data.user_id);
      return;
    }
    const currentClosestEventDate = new Date(userToUpdate.closestEventDate);
    const newClosestEventDate = new Date(data.start_date);
    if (newClosestEventDate < currentClosestEventDate || currentClosestEventDate < new Date() || !userToUpdate.closestEventName) {
      userToUpdate.closestEventName = data.eventName;
      userToUpdate.closestEventDate = data.start_date;
      await userToUpdate.save();
    }
  } catch (error) {
    console.error('Error in updateUsersClosestEvent:', error);
  }
}
