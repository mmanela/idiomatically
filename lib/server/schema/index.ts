import { mergeTypes } from 'merge-graphql-schemas';

import user from './user';
import idioms from './idiom';
import languages from './language';


export default mergeTypes([user, idioms, languages]);
