module.exports.createGroupSchema = function (gql) {
  return GroupSchema = gql`
    type Group {
      objectId: String!
      chatId:  String!
      name:  String!
      ownerId:  String!
      isDeleted: Boolean!
      createdAt: Int64!
      updatedAt: Int64!
    }

    extend type Subscription {
      groupChanged(chatIds: [String]!): Group!
    }

    extend type Query {
      groups: [Group]
    }

    extend type Mutation {
      insertGroup(objectId: String!, chatId:  String!, name:  String!, ownerId:  String!, isDeleted: Boolean!, createdAt: Int64!, updatedAt: Int64!): Group!
      updateGroup(objectId: String!, chatId:  String!, name:  String!, ownerId:  String!, isDeleted: Boolean!, createdAt: Int64!, updatedAt: Int64!): Group!
    }
  `
}

const GROUP_CHANGE = 'GROUP_CHANGE';

module.exports.createGroupResolver = function (database, Operation, withFilter, pubsub) {
  return resolver = {
    Subscription: {
      groupChanged: {
        subscribe: withFilter(
          () => pubsub.asyncIterator(GROUP_CHANGE),
          (payload, args) => args.chatIds.indexOf(payload.chatId) > -1
        )
      }
    },
    Query: {
      groups: async(root, args) => {
        return await database.models.Group.findAll();
      }
    },
    Mutation: {
      insertGroup: async(root, args, context, info) => {
        let group = await database.models.Group.create(args);
        pubsub.publish(GROUP_CHANGE, { 
          chatId: args.chatId,
          groupChanged: group.dataValues
        });
        return group;
      },
      updateGroup: async(root, args, context, info) => {
        const filter = { where: { chatId: args.chatId } }
        await database.models.Group.update(args, filter)
          .then(() => {
            pubsub.publish(GROUP_CHANGE, {
              chatId: args.chatId,
              groupChanged: args
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