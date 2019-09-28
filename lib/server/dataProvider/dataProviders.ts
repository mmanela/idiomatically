import { IdiomDataProvider } from './idiomDataProvider';
import { UserDataProvider } from './userDataProvider';

export interface DataProviders {
    idiom: IdiomDataProvider;
    user: UserDataProvider;
}