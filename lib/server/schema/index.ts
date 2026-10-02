import { mergeTypeDefs } from '@graphql-tools/merge';

import user from './user';
import idioms from './idiom';
import languages from './language';
import idiomChangeProposal from './idiomChangeProposal';


export default mergeTypeDefs([user, idioms, languages, idiomChangeProposal]);
