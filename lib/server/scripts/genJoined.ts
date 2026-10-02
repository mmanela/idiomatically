import typeDefs from '../schema';
import { writeFileSync } from 'fs'
import { print } from 'graphql';

writeFileSync('server/_graphql/joined.graphql', print(typeDefs));