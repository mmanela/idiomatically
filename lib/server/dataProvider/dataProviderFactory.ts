import { Db } from 'mongodb';
import { DataProviders } from './dataProviders';
import { UserDataProvider } from './userDataProvider';
import { IdiomDataProvider } from './idiomDataProvider';
import { IdiomChangeProposalDataProvider } from './IdiomChangeProposalDataProvider';

export function createDataProviders(mongodb: Db, isProd: boolean): DataProviders {
    let collectionPrefix = "";
    
    // Was using this but now just all prod
    // if (!isProd) {
    //     collectionPrefix = "dev_";
    // }
    const userDataProvider = new UserDataProvider(mongodb, collectionPrefix);
    const idiomDataProvider = new IdiomDataProvider(mongodb, userDataProvider, collectionPrefix);
    const changeProposal = new IdiomChangeProposalDataProvider(mongodb, userDataProvider, idiomDataProvider, collectionPrefix);

    return {
        idiom: idiomDataProvider,
        user: userDataProvider,
        changeProposal: changeProposal
    };
}