import { IdiomDataProvider } from './idiomDataProvider';
import { UserDataProvider } from './userDataProvider';
import { IdiomChangeProposalDataProvider } from './IdiomChangeProposalDataProvider';

export interface DataProviders {
    idiom: IdiomDataProvider;
    changeProposal: IdiomChangeProposalDataProvider;
    user: UserDataProvider;
}