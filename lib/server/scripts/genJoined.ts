import typeDefs from '../schema';
import { writeFileSync } from 'fs'

writeFileSync('_graphql/joined.graphql', typeDefs);