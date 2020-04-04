module.exports.createPersonSchema = function (gql) {
  return PersonSchema = gql`
    type Person {
      email: String!
      phone: String!
      firstname: String!
      lastname: String!
      fullname: String!
      country: String!
      location: String!
      pictureAt: Int64!
      status: String!
      keepMedia: Int!
      networkPhoto: Int!
      networkVideo: Int!
      networkAudio: Int!
      wallpaper: String!
      loginMethod: String!
      oneSignalId: String!
      lastActive: Int64!
      lastTerminate: Int64!
      createdAt: Int64!
      updatedAt: Int64!
    }

    extend type Subscription {
      personChanged(updatedAt: Int64!): Person!
    }

    extend type Query {
      persons: [Person]
      person(email: String!): [Person]
    }

    extend type Mutation {
      insertPerson(email: String!, phone: String!, firstname: String!, lastname: String!, fullname: String!, country: String!, location: String!, pictureAt: Int64!, status: String!, keepMedia: Int!, networkPhoto: Int!, networkVideo: Int!, networkAudio: Int!, wallpaper: String!, loginMethod: String!, oneSignalId: String!, lastActive: Int64!, lastTerminate: Int64!, createdAt: Int64!, updatedAt: Int64!): Person!
      updatePerson(email: String!, phone: String!, firstname: String!, lastname: String!, fullname: String!, country: String!, location: String!, pictureAt: Int64!, status: String!, keepMedia: Int!, networkPhoto: Int!, networkVideo: Int!, networkAudio: Int!, wallpaper: String!, loginMethod: String!, oneSignalId: String!, lastActive: Int64!, lastTerminate: Int64!, createdAt: Int64!, updatedAt: Int64!): Person!
    }
  `
}

const PERSON_CHANGE = 'PERSON_CHANGE';

module.exports.createPersonResolver = function (database, Operation, withFilter, pubsub) {
  return resolver = {
    Subscription: {
      personChanged: {
        subscribe: withFilter(
          () => pubsub.asyncIterator(PERSON_CHANGE),
          (payload, args) => { 
            return payload.updatedAt > args.updatedAt }
        )
      }
    },
    Query: {
      persons: async(root, args) => {
        return await database.models.Person.findAll();
      },
      persons: async(root, args) => {
        let filter = { 
          email: { 
            [Operation.eq]: args.email
          }
        }
        return await database.models.Person.findAll({ where: filter });
      }
    },
    Mutation: {
      insertPerson: async(root, args, context, info) => {
        let person = await database.models.Person.create(args);
        pubsub.publish(PERSON_CHANGE, {
          updatedAt: args.updatedAt,
          personChanged: person.dataValues
        });
        return person;
      },
      updatePerson: async(root, args, context, info) => {
        const filter = { where: { email: args.email } }
        await database.models.Person.update(args, filter)
          .then(() => {
            pubsub.publish(PERSON_CHANGE, {
              updatedAt: args.updatedAt,
              personChanged: args
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