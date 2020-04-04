module.exports.createDetailSchema = function (gql) {
  return DetailSchema = gql`
    type Detail {
      objectId: String!
      chatId:  String!
      userId:  String!
      typing: Boolean!
      lastRead: Int64!
      mutedUntil: Int64!
      isDeleted: Boolean!
      isArchived: Boolean!
      createdAt: Int64!
      updatedAt: Int64!
    }

    extend type Subscription {
      detailChanged(chatIds: [String]!): Detail!
    }

    extend type Query {
      detail(chatId: String!): [Detail]
    }

    extend type Mutation {
      insertDetail(objectId: String!, chatId:  String!, userId: String!, typing: Boolean!, lastRead: Int64!, mutedUntil: Int64!, isDeleted: Boolean!, isArchived: Boolean!, createdAt: Int64!, updatedAt: Int64!): Detail!
      updateDetail(objectId: String!, chatId:  String!, userId: String!, typing: Boolean!, lastRead: Int64!, mutedUntil: Int64!, isDeleted: Boolean!, isArchived: Boolean!, createdAt: Int64!, updatedAt: Int64!): Detail!
    }
  `
}

const DETAIL_CHANGE = 'DETAIL_CHANGE';

module.exports.createDetailResolver = function (database, Operation, withFilter, pubsub) {
  return resolver = {
    Subscription: {
      detailChanged: {
        subscribe: withFilter(
          () => pubsub.asyncIterator(DETAIL_CHANGE),
          (payload, args) => args.chatIds.indexOf(payload.chatId) > -1
        )
      }
    },
    Query: {
      detail: async(root, args) => {
        let filter = { 
          chatId: { 
            [Operation.eq]: args.chatId
          }
        }
        let teste = await database.models.Detail.findAll({ where: filter });
        console.log(teste)
        return teste
      }
    },
    Mutation: {
      insertDetail: async(root, args, context, info) => {
        let detail = await database.models.Detail.create(args);
        pubsub.publish(DETAIL_CHANGE, { 
          chatId: args.chatId,
          detailChanged: detail.dataValues 
        });
        return detail;
      },
      updateDetail: async(root, args, context, info) => {
        const filter = { where: { chatId: args.chatId } }
        await database.models.Detail.update(args, filter)
          .then(() => {
            pubsub.publish(DETAIL_CHANGE, {
              chatId: args.chatId,
              detailChanged: args
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