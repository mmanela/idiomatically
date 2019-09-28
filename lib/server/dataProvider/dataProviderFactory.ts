import { Db } from 'mongodb';
import { DataProviders } from './dataProviders';
import { UserDataProvider } from './userDataProvider';
import { IdiomDataProvider } from './idiomDataProvider';

export function createDataProviders(mongodb: Db): DataProviders {
    const userDataProvider = new UserDataProvider(mongodb);
    const idiomDataProvider = new IdiomDataProvider(mongodb, userDataProvider);

    return {
        idiom: idiomDataProvider,
        user: userDataProvider
    };
}