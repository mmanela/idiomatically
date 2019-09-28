import { Db, Collection, ObjectID, FilterQuery } from 'mongodb'
import { UserRole, ProviderType, QueryUsersArgs } from '../_graphql/types';
import { Profile } from 'passport';
import { UserModel } from '../model/types';
import { DbUser, mapDbUser } from './mapping';
import { escapeRegex } from './utils';

export class UserDataProvider {

    private userCollection: Collection<DbUser>;

    constructor(private mongodb: Db) {
        this.userCollection = mongodb.collection('user');
    }

    async getUser(id: string | ObjectID): Promise<UserModel> {
        try {
            const dbUser = await this.userCollection.findOne(new ObjectID(id));
            if (!dbUser) {
                throw new Error("Could not find user");
            }

            return mapDbUser(dbUser);
        }
        catch {
            return null;
        }
    }

    async getUsers(ids: ObjectID[]): Promise<UserModel[]> {
        ids = ids || [];
        let dbUsers: DbUser[];
        try {
            const objectIds = [...new Set(ids.filter(id => !!id))].map(id => new ObjectID(id));
            dbUsers = await this.userCollection.find({ _id: { $in: objectIds } }).toArray() || [];
            return dbUsers.map(user => mapDbUser(user));
        }
        catch {
            return [];
        }
    }

    async queryUsers(args: QueryUsersArgs): Promise<UserModel[]> {
        const filter = args && args.filter ? args.filter : null;
        const limit = args && args.limit ? args.limit : 50;

        let findFilter: FilterQuery<DbUser>;
        let sortObj: object = { name: -1 };

        if (filter) {
            const filterRegex = escapeRegex(filter);
            const filterRegexObj = { $regex: filterRegex, $options: 'i' };

            // NOTE: Bug in cosmodb mongo support doesn't handle regex over sub-document array
            //       fall back to exact match
            findFilter = { $or: [{ name: filterRegexObj }, { "providers.email": filter }] };
        }

        const dbUsers = await this.userCollection
            .find(findFilter)
            .sort(sortObj)
            .limit(limit)
            .toArray();

        return dbUsers.map(user => mapDbUser(user));;
    }

    async ensureUserFromLogin(profile: Profile): Promise<UserModel> {
        if (!profile || !profile.id || !profile.displayName || !profile.provider) {
            throw new Error("Invalid user profile");
        }

        const email = profile.emails && profile.emails[0].value ? profile.emails[0].value : null;
        const avatar = profile.photos && profile.photos[0].value ? profile.photos[0].value : null;
        const providerType = <ProviderType>profile.provider.toUpperCase();

        // Find this user given provider id
        let dbUser = await this.userCollection.findOne({ 'providers.externalId': { $eq: profile.id } });
        if (dbUser) {
            const matchedProviders = dbUser.providers.filter(p => p.externalId === profile.id);
            const providerToUpdate = matchedProviders && matchedProviders[0] ? matchedProviders[0] : null;
            const objId = new ObjectID(dbUser._id);

            dbUser.name = profile.displayName;
            dbUser.avatar = avatar;
            if (providerToUpdate) {
                providerToUpdate.email = email;
                providerToUpdate.name = profile.displayName;
                providerToUpdate.avatar = avatar;
            }

            // TODO: Once cosmodb supports proper array operators ($) then switch to update
            //       with those
            const result = await this.userCollection.replaceOne(
                { _id: objId, "providers.externalId": profile.id },
                dbUser);

            if (result.modifiedCount <= 0) {
                console.trace("Nothing changed in this user after login")
            }
        }
        else {
            // Add this user
            dbUser = {
                name: profile.displayName,
                avatar: avatar,
                role: email && this.isHarcodedSuperUser(email) ? UserRole.Admin : UserRole.General,
                providers: [{
                    email: email,
                    externalId: profile.id,
                    name: profile.displayName,
                    avatar: avatar,
                    type: providerType,
                }]

            }
            const result = await this.userCollection.insertOne(dbUser);
            if (result.insertedCount <= 0) {
                throw new Error("Failed to insert user");
            }

            dbUser._id = result.insertedId;
        }

        return mapDbUser(dbUser);
    }

    private isHarcodedSuperUser(email: string) {
        email = email.toLocaleLowerCase();
        return email == "mmanela@gmail.com" ||
            email == "mallory.emerson@gmail.com";
    }

}