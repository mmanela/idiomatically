import { Db, Collection, ObjectID, FilterQuery } from 'mongodb';
import { IdiomOperationResult, OperationStatus, IdiomChangeProposal, QueryIdiomChangeProposalsArgs, MutationAcceptIdiomChangeProposalArgs, MutationRejectIdiomChangeProposalArgs } from '../_graphql/types';
import { DbIdiom, DbIdiomChangeProposal, IdiomProposalType, Paged } from './mapping';
import { UserDataProvider } from './userDataProvider';
import { IdiomDataProvider } from './idiomDataProvider';

export class IdiomChangeProposalDataProvider {
    private changeProposalCollection: Collection<DbIdiomChangeProposal>;
    constructor(private mongodb: Db, private userDataProvider: UserDataProvider, private idiomDataProvider: IdiomDataProvider, collectionPrefix: string) {
        this.changeProposalCollection = mongodb.collection(collectionPrefix + 'idiomChangeProposal');
    }
    async rejectIdiomChangeProposal(args: MutationRejectIdiomChangeProposalArgs): Promise<IdiomOperationResult> {
        if (!args.proposalId) {
            throw new Error("Id is missing");
        }
        const res = await this.changeProposalCollection.deleteOne({ _id: new ObjectID(args.proposalId) });
        return {
            status: res.deletedCount > 0 ? OperationStatus.Success : OperationStatus.Failure
        };
    }

    async acceptIdiomChangeProposal(args: MutationAcceptIdiomChangeProposalArgs) {
        if (!args.proposalId) {
            throw new Error("Id is missing");
        }

        if (!args.body) {
            throw new Error("Body is missing");
        }

        let idiomOperationResult: IdiomOperationResult = null;
        const changeProposal: DbIdiomChangeProposal = JSON.parse(args.body);
        const userModel = await this.userDataProvider.getUser(changeProposal.userId);
        switch (changeProposal.type) {
            case IdiomProposalType.CreateIdiom:
                if (!changeProposal.idiomToCreate) {
                    throw new Error("Idiom to create must not be null");
                }
                idiomOperationResult = await this.idiomDataProvider.createIdiomInternal(true, userModel, changeProposal.idiomToCreate, changeProposal.equivalentId);
                break;
            case IdiomProposalType.UpdateIdiom:
                if (!changeProposal.idiomToUpdate || !changeProposal.idiomId) {
                    throw new Error("Idiom to update must not be null");
                }
                idiomOperationResult = await this.idiomDataProvider.updateIdiomInternal(true, userModel, changeProposal.idiomId, changeProposal.idiomToUpdate);
                break;
            case IdiomProposalType.DeleteIdiom:
                if (!changeProposal.idiomId) {
                    throw new Error("IdiomId to update must not be null");
                }
                idiomOperationResult = await this.idiomDataProvider.deleteIdiom(userModel, changeProposal.idiomId, true);
                break;

            case IdiomProposalType.AddEquivalent:
                if (!changeProposal.idiomId || !changeProposal.equivalentId) {
                    throw new Error("Idiom Id and Equivilent Id must not be null");
                }

                idiomOperationResult = await this.idiomDataProvider.addIdiomEquivalent(userModel, changeProposal.idiomId, changeProposal.equivalentId, true);
                break;

            case IdiomProposalType.DeleteEquivalent:
                if (!changeProposal.idiomId || !changeProposal.equivalentId) {
                    throw new Error("Idiom Id and Equivilent Id must not be null");
                }

                idiomOperationResult = await this.idiomDataProvider.removeIdiomEquivalent(userModel, changeProposal.idiomId, changeProposal.equivalentId, true);
                break;

            default:
                throw new Error("Proposal type not supported yet");
        }

        if (idiomOperationResult.status == OperationStatus.Success) {
            const res = await this.changeProposalCollection.deleteOne({ _id: new ObjectID(args.proposalId) });
        }
        return idiomOperationResult;
    }

    async queryIdiomChangeProposals(args: QueryIdiomChangeProposalsArgs): Promise<Paged<IdiomChangeProposal>> {
        const filter = args && args.filter ? args.filter : undefined;
        const limit = args && args.limit ? args.limit : 50;
        let skip = args && args.cursor && Number.parseInt(args.cursor);
        if (isNaN(skip)) {
            skip = 0;
        }

        let totalCount = null;
        let dbProposals: DbIdiomChangeProposal[];
        let findFilter: FilterQuery<DbIdiom>;
        let sortObj: object = { createdAt: -1 };
        if (filter) {
            const filterQuery = { type: { $eq: filter } };
            findFilter = filterQuery;
        }

        totalCount = await this.changeProposalCollection.countDocuments(findFilter);
        dbProposals = await this.changeProposalCollection
            .find(findFilter)
            .sort(sortObj)
            .skip(skip)
            .limit(limit)
            .toArray();

        return {
            totalCount: totalCount,
            limit: limit,
            skip: skip,
            count: dbProposals.length,
            result: dbProposals.map<IdiomChangeProposal>(proposal => {
                return {
                    id: proposal._id.toHexString(),
                    readOnlyType: proposal.type,
                    readOnlyCreatedBy: proposal.readOnlyCreatedBy,
                    readOnlyTitle: proposal.readOnlyTitle,
                    readOnlySlug: proposal.readOnlySlug,
                    body: JSON.stringify(proposal)
                };
            })
        };
    }
}
