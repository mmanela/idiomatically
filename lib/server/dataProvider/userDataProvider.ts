import { Db, Collection, ObjectId, Filter, Sort } from 'mongodb'
import { UserRole, ProviderType, QueryUsersArgs } from '../_graphql/types';
import { UserModel } from '../model/types';
import { DbUser, mapDbUser } from './mapping';
import { escapeRegex } from './utils';

export type AuthIdentity = {
    id: string;
    name: string;
    email: string;
    avatar?: string | null;
    role?: string | null;
    provider: "GOOGLE" | "LOCAL";
};

export class UserDataProvider {

    private userCollection: Collection<DbUser>;

    constructor(private mongodb: Db, collectionPrefix: string) {
        this.userCollection = mongodb.collection(collectionPrefix + 'user');
    }

    async getUser(id: string | ObjectId): Promise<UserModel> {
        try {
            const dbUser = await this.userCollection.findOne(new ObjectId(id));
            if (!dbUser) {
                throw new Error("Could not find user");
            }

            return mapDbUser(dbUser);
        }
        catch {
            return null;
        }
    }

    async getUsers(ids: ObjectId[]): Promise<UserModel[]> {
        ids = ids || [];
        let dbUsers: DbUser[];
        try {
            const objectIds = [...new Set(ids.filter(id => !!id))].map(id => new ObjectId(id));
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

        let findFilter: Filter<DbUser> = {};
        const sortObj: Sort = { name: -1 };

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

    async ensureUserFromAuth(identity: AuthIdentity, adminEmails: string[]): Promise<UserModel> {
        if (!identity.id || !identity.name || !identity.email) {
            throw new Error("Invalid authenticated identity");
        }

        const email = identity.email.toLowerCase();
        const avatar = identity.avatar || null;
        const providerType = identity.provider === "LOCAL" ? ProviderType.Local : ProviderType.Google;
        const role = identity.role
            ? identity.role.toUpperCase() as UserRole
            : this.isHarcodedSuperUser(email, adminEmails)
                ? UserRole.Admin
                : UserRole.General;

        let dbUser: DbUser | null = await this.userCollection.findOne({
            $or: [
                { 'providers.externalId': identity.id },
                { 'providers.email': email }
            ]
        });
        if (dbUser) {
            const matchedProviders = dbUser.providers.filter(
                provider => provider.externalId === identity.id || provider.email?.toLowerCase() === email
            );
            const providerToUpdate = matchedProviders && matchedProviders[0] ? matchedProviders[0] : null;
            const objId = new ObjectId(dbUser._id);

            dbUser.name = identity.name;
            dbUser.avatar = avatar;
            dbUser.role = role;
            if (providerToUpdate) {
                providerToUpdate.externalId = identity.id;
                providerToUpdate.email = email;
                providerToUpdate.name = identity.name;
                providerToUpdate.avatar = avatar;
                providerToUpdate.type = providerType;
            } else {
                dbUser.providers.push({
                    email,
                    externalId: identity.id,
                    name: identity.name,
                    avatar,
                    type: providerType,
                });
            }

            await this.userCollection.replaceOne({ _id: objId }, dbUser);
        }
        else {
            dbUser = {
                name: identity.name,
                avatar: avatar,
                role,
                providers: [{
                    email: email,
                    externalId: identity.id,
                    name: identity.name,
                    avatar: avatar,
                    type: providerType,
                }]

            }
            const result = await this.userCollection.insertOne(dbUser);
            dbUser._id = result.insertedId;
        }

        return mapDbUser(dbUser);
    }

    private isHarcodedSuperUser(email: string, adminEmails: string[]) {
        email = email.toLocaleLowerCase();
        return adminEmails.indexOf(email) >= 0;
    }

}