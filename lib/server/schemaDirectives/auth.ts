import { defaultFieldResolver, GraphQLObjectType, GraphQLField } from "graphql";
import { SchemaDirectiveVisitor } from 'apollo-server-express';
import { GlobalContext } from '../model/types';
import { UserRole } from '../_graphql/types';

type RequireAuthRole = { _requiredAuthRole?: string, _authFieldsWrapped?: boolean };
type GraphQLObjectTypeExtended = GraphQLObjectType & RequireAuthRole;
type GraphQLFieldExtended = GraphQLField<any, any> & RequireAuthRole;

export class AuthDirective extends SchemaDirectiveVisitor {
    visitObject(type: GraphQLObjectTypeExtended) {
        this.ensureFieldsWrapped(type);
        type._requiredAuthRole = this.args.requires;
    }
    // Visitor methods for nested types like fields and arguments
    // also receive a details object that provides information about
    // the parent and grandparent types.
    visitFieldDefinition(field: GraphQLFieldExtended, details: {
        objectType: GraphQLObjectTypeExtended;
    }) {
        this.ensureFieldsWrapped(details.objectType);
        field._requiredAuthRole = this.args.requires;
    }

    ensureFieldsWrapped(objectType: GraphQLObjectTypeExtended) {
        // Mark the GraphQLObjectType object to avoid re-wrapping:
        if (objectType._authFieldsWrapped) return;
        objectType._authFieldsWrapped = true;

        const fields = objectType.getFields();

        Object.keys(fields).forEach(fieldName => {
            const field: GraphQLFieldExtended = fields[fieldName];
            const { resolve = defaultFieldResolver } = field;
            field.resolve = async function (...args) {
                let context: GlobalContext = args[2];

                // Get the required Role from the field first, falling back
                // to the objectType if no Role is required by the field:
                const requiredRole =
                    field._requiredAuthRole ||
                    objectType._requiredAuthRole;

                if (!requiredRole) {
                    return resolve.apply(this, args);
                }

                const user = context.currentUser;
                if (!user) {
                    throw new Error("User must be logged in");
                }
                else if (!user.hasRole(requiredRole)) {
                    throw new Error("User is not authorized to access this resource");
                }

                return resolve.apply(this, args);
            };
        });
    }
};