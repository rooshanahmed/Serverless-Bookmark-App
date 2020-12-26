const { ApolloServer, gql } = require("apollo-server-lambda")
const faunadb = require("faunadb")
const q = faunadb.query

const typeDefs = gql`
  type Query {
    bookmark: [Bookmark!]
  }
  type Bookmark {
    id: ID!
    url: String!
    desc: String!
  }
  type Mutation {
    addBookmark(url: String!, desc: String!): Bookmark
  }
`

const resolvers = {
  Query: {
    bookmark: async (root, args, context) => {
      const client = new faunadb.Client({
        secret: process.env.FAUNADB_ADMIN_SECRET,
      })

      try {
        const result = await client.query(
          q.Map(
            q.Paginate(q.Match(q.Index("url"))),
            q.Lambda(x => q.Get(x))
          )
        )
        console.log(result.data)
        return result.data.map(d => {
          return {
            id: d.ts,
            url: d.data.url,
            desc: d.data.desc,
          }
        })
      } catch (error) {
        console.log(error)
      }
    },
  },
  Mutation: {
    addBookmark: async (_, { url, desc }) => {
      const client = new faunadb.Client({
        secret: process.env.FAUNADB_ADMIN_SECRET,
      })

      try {
        const result = await client.query(
          q.Create(q.Collection("links"), { data: { url, desc } })
        )
        console.log("Entry Created:", result.data)
        return result.ref.data
      } catch (error) {
        console.log(error)
      }
      console.log("Url: ", url, "Desc: ", desc)
    },
  },
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
})

const handler = server.createHandler()

module.exports = { handler }
