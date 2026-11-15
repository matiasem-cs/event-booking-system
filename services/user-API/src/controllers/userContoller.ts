import { Request, Response } from 'express';
import User, {UserModel} from "../models/user";
import {isValidMongoId, UserPermission} from "../consts";

export const createUser = async (req: Request, res: Response): Promise<void> => {
    try {
        console.log(req.body);
        // create a new rating

        const { username, password, secQuestion, secAnswer } = req.body;
        let newUser = new User({ username, password, secQuestion, secAnswer });
        try {
            await newUser.validate();
        }
        catch (error) {
            res.status(400).json({ message: 'Invalid username or password' });
            return;
        }

        await newUser.save();
        res.status(201).json({ message: 'User created successfully', user: newUser });
    } catch (error) {
        // signup - username already exists.
        if (error.code === 11000 && error.keyPattern?.hasOwnProperty('username')) {
            res.status(400).json({message: 'Username already exists'});
            return;
        }
        res.status(500).json({ message: 'Server Error - :(' });
    }
};//createUser

export const getUserById = async (req: Request, res: Response): Promise<void> => {
    try {
        console.log(req.params)
        const userId: string = req.params.userId;

        if (!isValidMongoId(userId)) {  // validate id format
            res.status(400).json({ message: `invalid mongoDB id format`})
            return;
        }
        const userDoc: UserModel[] = await User.findById( userId );

        if (!userDoc) {
            res.status(404).json({ message: "user id not found"})
            return;
        }
        res.status(200).json({ userDoc });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};//getUserById

export const getUserByUsername = async (req: Request, res: Response) => {
    try {
        const username : string = req.params.username;

        if (!username) {
            res.status(400).json( {message: 'invalid username'});
            return;
        }

        const userDoc : UserModel  = await User.findOne ( {username} );

        if (!userDoc) {
            res.status(404).json({ message: "User not found"})
            return;
        }

        res.status(200).json({userDoc} )

    } catch (error) {
        res.status(500).json( {message: 'Server Error'});
        return;
    }
}//getUserByUsername


export const updateUserPassword = async (req: Request, res: Response): Promise<void> => {
    try {
        console.log(`newPassword: ${req.body.newPassword}, username: ${req.params.username}`)
        const { newPassword } = req.body; //todo: additional body validations?
        const username : string = req.params.username;
        const updatedPassword = {password : newPassword}

        /* body and param validations */
        if (!username) {
              res.status(400).json( {message: 'Invalid username'});
              return;
       }

        if (!newPassword) {
            res.status(400).json( {message: 'Invalid password'});
            return;
        }

        const updatedUser: UserModel | null = await User.findOneAndUpdate({username}, updatedPassword)    // todo: this needs encryption

        updatedUser.password = newPassword; //so the updated value would show on the success message

        if (!updatedUser) {
            res.status(404).json( {message: 'No such username exists'});
            return;
        }

        res.status(200).json({ message: 'User password updated successfully!', user: updatedUser });
        return;

  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
    return;
  }

};//updateUserPassword


export const updateUserPermission = async (req: Request, res: Response) => {
    try {
        // todo: add authentication check for admin

        const { newPermission } = req.body;
        const username : string = req.params.username;
        const updatedPermission = {permission : newPermission }

        /* body and param validations */
        if (!username) {
            res.status(400).json( {message: 'Invalid username'});
            return;
        }

        if (!(Object.values(UserPermission).includes(newPermission))) {
            // check body permission is a valid Enum UserPermission value
            res.status(400).json( {message: 'Invalid permission'});
            return;
        }

        const updatedUser : UserModel | null = await User.findOneAndUpdate({username}, updatedPermission)

        if (!updatedUser) {
            res.status(404).json( {message: 'No such username exists'});
            return;
        }

        updatedUser.permission = newPermission; //so the updated value would show on the success message

        await res.status(200).json({ message: 'User permission updated successfully!', user: updatedUser });
        return;

    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
        return
    }
}//updateUserPermission


//todo: test this endpoint
export const updateRatingCounter = async (req: Request, res: Response) => {
    try {
        const updatedRating = req.body;
        const username = req.params.username;
        const updatedField = {ratingCounter: updatedRating};

        /* body and param validations */
        if (!username) {
            res.status(400).json( {message: 'Invalid username'});
            return;
        }

        if (!updatedRating) {
            res.status(400).json( {message: 'Invalid rating'});
            return;
        }

        const updatedUser : UserModel | null = await User.findOneAndUpdate({username}, updatedField)

        updatedUser.ratingCounter = updatedRating; //for success message

        await res.status(200).json({ message: 'User rating counter updated successfully!', user: updatedUser });


    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
}
