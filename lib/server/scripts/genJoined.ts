import typeDefs from '../schema';
import { writeFileSync } from 'fs'

writeFileSync('server/_graphql/joined.graphql', typeDefs);