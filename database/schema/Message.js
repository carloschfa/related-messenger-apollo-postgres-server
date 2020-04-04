module.exports.createMessageSchema = function (gql) {
  return MessageSchema = gql`
    type Message {
      objectId: String!
      chatId: String!
      userId: String!
      userFullname: String!
      userInitials: String!
      userPictureAt: Int64!
      type: String!
      text: String!
      photoWidth: Int!
      photoHeight: Int!
      videoDuration: Int!
      audioDuration: Int!
      latitude: Float!
      longitude: Float!
      isMediaQueued: Boolean!
      isMediaFailed: Boolean!
      isDeleted: Boolean!
      createdAt: Int64!
      updatedAt: Int64!
    }

    extend type Subscription {
      messageChanged(chatIds: [String]!, updatedAt: Int64!): Message!
    }

    extend type Query {
      messages(chatId: String!): [Message]
    }

    extend type Mutation {
      insertMessage(objectId: String!, chatId: String!, userId: String!, userFullname: String!, userInitials: String!, userPictureAt: Int64!, type: String!, text: String!, photoWidth: Int!, photoHeight: Int!, videoDuration: Int!, audioDuration: Int!, latitude: Float!, longitude: Float!, isMediaQueued: Boolean!, isMediaFailed: Boolean!, isDeleted: Boolean!, createdAt: Int64!, updatedAt: Int64!): Message!
      updateMessage(objectId: String!, chatId: String!, userId: String!, userFullname: String!, userInitials: String!, userPictureAt: Int64!, type: String!, text: String!, photoWidth: Int!, photoHeight: Int!, videoDuration: Int!, audioDuration: Int!, latitude: Float!, longitude: Float!, isMediaQueued: Boolean!, isMediaFailed: Boolean!, isDeleted: Boolean!, createdAt: Int64!, updatedAt: Int64!): Message!
    }
  `
}

const MESSAGE_CHANGE = 'MESSAGE_CHANGE';

module.exports.createMessageResolver = function (database, Operation, withFilter, pubsub) {
  return resolver = {
    Subscription: {
      messageChanged: {
        subscribe: withFilter(
          () => pubsub.asyncIterator(MESSAGE_CHANGE),
          (payload, args) => (args.chatIds.indexOf(payload.chatId) > -1) && (payload.updatedAt > args.updatedAt)
        )
      }
    },
    Query: {
      messages: async(root, args) => {
        let filter = { 
          chatId: { 
            [Operation.eq]: args.chatId
          }
        }
        return await database.models.Message.findAll({ where: filter});
      }
    },
    Mutation: {
      insertMessage: async(root, args, context, info) => {
        let message = await database.models.Message.create(args);
        pubsub.publish(MESSAGE_CHANGE, { 
          chatId: args.chatId,
          updatedAt: args.updatedAt,
          messageChanged: message.dataValues 
        });
        return message;
      },
      updateMessage: async(root, args, context, info) => {
        const filter = { where: { chatId: args.chatId } }
        await database.models.Message.update(args, filter)
          .then(() => {
            pubsub.publish(MESSAGE_CHANGE, {
              chatId: args.chatId,
              updatedAt: args.updatedAt,
              messageChanged: args
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