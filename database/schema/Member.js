module.exports.createMemberSchema = function (gql) {
  return MemberSchema = gql`
    type Member {
      objectId: String!
      chatId: String!
      userId: String!
      isActive: Boolean!
      createdAt: Int64!
      updatedAt: Int64!
    }

    extend type Subscription {
      memberChanged(chatIds: [String]!): Member!
    }

    extend type Query {
      members(chatId: String!): [Member]
    }

    extend type Mutation {
      insertMember(objectId: String!, chatId: String!, userId: String!, isActive: Boolean!, createdAt: Int64!, updatedAt: Int64!): Member!
      updateMember(objectId: String!, chatId: String!, userId: String!, isActive: Boolean!, createdAt: Int64!, updatedAt: Int64!): Member!
    }
  `
}

const MEMBER_CHANGE = 'MEMBER_CHANGE';

module.exports.createMemberResolver = function (database, Operation, withFilter, pubsub) {
  return resolver = {
    Subscription: {
      memberChanged: {
        subscribe: withFilter(
          () => pubsub.asyncIterator(MEMBER_CHANGE),
          (payload, args) => args.chatIds.indexOf(payload.chatId) > -1
        )
      }
    },
    Query: {
      members: async(root, args) => {
        let filter = { 
          chatId: { 
            [Operation.eq]: args.chatId
          }
        }
        return await database.models.Member.findAll({ where: filter });
      }
    },
    Mutation: {
      insertMember: async(root, args, context, info) => {
        let member = await database.models.Member.create(args);
        pubsub.publish(MEMBER_CHANGE, {
          chatId: args.chatId,
          memberChanged: member.dataValues 
        });
        return member;
      },
      updateMember: async(root, args, context, info) => {
        const filter = { where: { chatId: args.chatId } }
        await database.models.Member.update(args, filter)
          .then(() => {
            pubsub.publish(MEMBER_CHANGE, {
              chatId: args.chatId,
              memberChanged: args
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