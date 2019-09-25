import { DataProvider } from '../dataProvider';
import { User, Login, UserRole } from '../_graphql/types';

export interface GlobalContext {
    db: DataProvider,
    currentUser: UserModel
}

export interface IdiomExpandOptions {
    expandEquivalents: boolean;
    expandUsers: boolean;
}

export class UserModel implements User {
    id: string;
    name: string;
    avatar: string;
    role?: UserRole;
    providers: Login[];


    hasEditPermission() {
        return this.role !== UserRole.General;
    }

    hasRole(requiredRole: string | UserRole) {
        if (!requiredRole) {
            throw new Error("Role must not be empty.");
        }

        requiredRole = requiredRole.toUpperCase();
        switch (this.role) {
            case UserRole.Admin:
                // Admins can do all the things
                return true;

            case UserRole.Contributor:
                // As long as you don't need admin you are fine
                return requiredRole !== UserRole.Admin;

            case UserRole.General:
                return requiredRole === UserRole.General;

            default:
                return false;
        }
    }
}