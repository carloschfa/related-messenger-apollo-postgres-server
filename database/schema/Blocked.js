module.exports.createBlockedSchema = function (gql) {
  return BlockedSchema = gql`
    type Blocked {
      objectId: String!
      blockerId: String!
      blockedId: String!
      isDeleted: Boolean!
      createdAt: Int64!
      updatedAt: Int64!
    }

    extend type Subscription {
      blockedChanged(blockedId: String!): Blocked!
      blockerChanged(blockerId: String!): Blocked!
    }

    extend type Query {
      blockeds(blockedId: String!): [Blocked]
      blockers(blockerId: String!): [Blocked]
    }

    extend type Mutation {
      insertBlocked(objectId: String!, blockerId: String!, blockedId: String!, isDeleted: Boolean!, createdAt: Int64!, updatedAt: Int64!): Blocked!
      updateBlocked(objectId: String!, blockerId: String!, blockedId: String!, isDeleted: Boolean!, createdAt: Int64!, updatedAt: Int64!): Blocked!
    }
  `
}

const BLOCKED_CHANGE = 'BLOCKED_CHANGE';
const BLOCKER_CHANGE = 'BLOCKER_CHANGE';

module.exports.createBlockedResolver = function (database, Operation, withFilter, pubsub) {
  return resolver = {
    Subscription: {
      blockedChanged: {
        subscribe: withFilter(
          () => pubsub.asyncIterator(BLOCKED_CHANGE),
          (payload, args) => { 
            return args.blockedId === payload.blockedId }
        )
      },
      blockerChanged: {
        subscribe: withFilter(
          () => pubsub.asyncIterator(BLOCKER_CHANGE),
          (payload, args) => { 
            return args.blockerId === payload.blockerId }
        )
      }
    },
    Query: {
      blockeds: async(root, args) => {
        let filter = { 
          blockedId: { 
            [Operation.eq]: args.blockedId
          }
        }
        return await database.models.Blocked.findAll({ where: filter });
      },
      blockers: async(root, args) => {
        let filter = { 
          blockerId: { 
            [Operation.eq]: args.blockerId
          }
        }
        return await database.models.Blocked.findAll({ where: filter });
      }
    },
    Mutation: {
      insertBlocked: async(root, args, context, info) => {
        let blocked = await database.models.Blocked.create(args);
        pubsub.publish(BLOCKED_CHANGE, { 
          blockedId: args.blockedId,
          blockedChanged: blocked.dataValues 
        });
        pubsub.publish(BLOCKER_CHANGE, { 
          blockerId: args.blockerId,
          blockerChanged: blocked.dataValues 
        });
        return blocked;
      },
      updateBlocked: async(root, args, context, info) => {
        const filter = { where: { blockedId: args.blockedId } }
        await database.models.Blocked.update(args, filter)
          .then(() => {
            pubsub.publish(BLOCKED_CHANGE, {
              blockedId: args.blockedId,
              blockedChanged: args
            });
            pubsub.publish(BLOCKER_CHANGE, { 
              blockerId: args.blockerId,
              blockerChanged: args 
            });
          })
          .catch((error) => {
            console.log('error', error)
          });
        return args;
      }
    }
  }
}