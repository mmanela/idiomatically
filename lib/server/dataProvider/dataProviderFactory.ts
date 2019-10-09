import { Db } from 'mongodb';
import { DataProviders } from './dataProviders';
import { UserDataProvider } from './userDataProvider';
import { IdiomDataProvider } from './idiomDataProvider';

export function createDataProviders(mongodb: Db, isProd: boolean): DataProviders {
    let collectionPrefix = "";
    if (!isProd) {
        collectionPrefix = "dev_";
    }
    const userDataProvider = new UserDataProvider(mongodb, collectionPrefix);
    const idiomDataProvider = new IdiomDataProvider(mongodb, userDataProvider, collectionPrefix);

    return {
        idiom: idiomDataProvider,
        user: userDataProvider
    };
}