module.exports.createSingleSchema = function (gql) {
  return SingleSchema = gql`
    type Single {
      objectId: String!
      chatId: String!
      userId1: String!
      fullname1: String!
      initials1: String!
      pictureAt1: Int64!
      userId2: String!
      fullname2: String!
      initials2: String!
      pictureAt2: Int64!
      createdAt: Int64!
      updatedAt: Int64!
    }

    extend type Subscription {
      single1Changed(userId1: String!): Single!
      single2Changed(userId2: String!): Single!
    }

    extend type Query {
      single(chatId: String!): [Single]
      singlesByUserId1(userId1: String!): [Single]
      singlesByUserId2(userId2: String!): [Single]
    }

    extend type Mutation {
      insertSingle(objectId: String!, chatId: String!, userId1: String!, fullname1: String!, initials1: String!, pictureAt1: Int64!, userId2: String!, fullname2: String!, initials2: String!, pictureAt2: Int64!, createdAt: Int64!, updatedAt: Int64!): Single!
      updateSingle1(objectId: String!, chatId: String!, userId1: String!, fullname1: String!, initials1: String!, pictureAt1: Int64!, userId2: String!, fullname2: String!, initials2: String!, pictureAt2: Int64!, createdAt: Int64!, updatedAt: Int64!): Single!
      updateSingle2(objectId: String!, chatId: String!, userId1: String!, fullname1: String!, initials1: String!, pictureAt1: Int64!, userId2: String!, fullname2: String!, initials2: String!, pictureAt2: Int64!, createdAt: Int64!, updatedAt: Int64!): Single!
    }
  `
}

const SINGLE1_CHANGE = 'SINGLE1_CHANGE';
const SINGLE2_CHANGE = 'SINGLE2_CHANGE';

module.exports.createSingleResolver = function (database, Operation, withFilter, pubsub) {
  return resolver = {
    Subscription: {
      single1Changed: {
        subscribe: withFilter(
          () => pubsub.asyncIterator(SINGLE1_CHANGE),
          (payload, args) => args.userId1 === payload.userId1
        )
      },
      single2Changed: {
        subscribe: withFilter(
          () => pubsub.asyncIterator(SINGLE2_CHANGE),
          (payload, args) => args.userId2 === payload.userId2
        )
      }
    },
    Query: {
      single: async(root, args) => {
        let filter = { 
          chatId: { 
            [Operation.eq]: args.chatId
          }
        }
        return await database.models.Single.findAll({ where: filter });
      },
      singlesByUserId1: async(root, args) => {
        let filter = { 
          userId1: { 
            [Operation.eq]: args.userId1
          }
        }
        return await database.models.Single.findAll({ where: filter });
      },
      singlesByUserId2: async(root, args) => {
        let filter = { 
          userId2: { 
            [Operation.eq]: args.userId2
          }
        }
        return await database.models.Single.findAll({ where: filter });
      }
    },
    Mutation: {
      insertSingle: async(root, args, context, info) => {
        let single = await database.models.Single.create(args);
        pubsub.publish(SINGLE1_CHANGE, { 
          userId1: args.userId1,
          single1Changed: single.dataValues 
        });
        pubsub.publish(SINGLE2_CHANGE, { 
          userId2: args.userId2,
          single2Changed: single.dataValues 
        });
        return single;
      },
      updateSingle1: async(root, args, context, info) => {
        const filter = { where: { userId1: args.userId1 } }
        await database.models.Single.update(args, filter)
          .then(() => {
            pubsub.publish(SINGLE1_CHANGE, { 
              userId1: args.userId1,
              single1Changed: args
            });
          })
          .catch((error) => {
            console.log('error', error)
          });
        return args;
      },
      updateSingle2: async(root, args, context, info) => {
        const filter = { where: { userId2: args.userId2 } }
        await database.models.Single.update(args, filter)
          .then(() => {
            pubsub.publish(SINGLE2_CHANGE, { 
              userId2: args.userId2,
              single2Changed: args
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