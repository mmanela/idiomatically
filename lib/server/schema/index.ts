import { mergeTypes } from 'merge-graphql-schemas';

import user from './user';
import idioms from './idiom';
import languages from './language';
import idiomChangeProposal from './idiomChangeProposal';


export default mergeTypes([user, idioms, languages, idiomChangeProposal]);
