import { gql } from 'apollo-server-express';

export default gql`
  type Query {
    idiomChangeProposal(id: ID): IdiomChangeProposal! @auth(requires: ADMIN)
    idiomChangeProposals(cursor: String, filter: String, limit: Int): IdiomChangeProposalConnection! @auth(requires: ADMIN)
  }

  type Mutation {
    acceptIdiomChangeProposal(
      proposalId: ID!
    ): Boolean! @auth(requires: ADMIN)

    rejectIdiomChangeProposal(
      proposalId: ID!
    ): Boolean! @auth(requires: ADMIN)
  }

  type IdiomChangeProposalConnection {
    edges: [IdiomChangeProposalEdge!]!
    pageInfo: PageInfo!
  }
  
  type IdiomChangeProposalEdge {
    cursor: String!
    node: IdiomChangeProposal!
  }

  type IdiomChangeProposal {
    id: ID!
    body: String!
  }
`;
