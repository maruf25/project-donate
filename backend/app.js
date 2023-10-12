const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const http = require("http");
require("dotenv").config();
const { ApolloServer } = require("@apollo/server");
const { expressMiddleware } = require("@apollo/server/express4");
const { ApolloServerPluginDrainHttpServer } = require("@apollo/server/plugin/drainHttpServer");
const { makeExecutableSchema } = require("@graphql-tools/schema");
const { WebSocketServer } = require("ws");
const { useServer } = require("graphql-ws/lib/use/ws");

const db = require("./utils/db");
const User = require("./models/UserModels");
const Donation = require("./models/DonationModels");
const Preference = require("./models/PreferenceModel");
const typeDefs = require("./graphql/schema");
const resolver = require("./graphql/resolver");
const auth = require("./middleware/auth");

async function startServer() {
  const app = express();

  const httpServer = http.createServer(app);
  // Create websocket server
  const wsServer = new WebSocketServer({
    server: httpServer,
    path: "/graphql",
  });

  const schema = makeExecutableSchema({ typeDefs, resolvers: resolver });

  const serverCleanup = useServer({ schema }, wsServer);

  const server = new ApolloServer({
    schema,
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      {
        async serverWillStart() {
          return {
            async drainServer() {
              await serverCleanup.dispose();
            },
          };
        },
      },
    ],
    formatError: (err) => {
      const message = err.message || "An occured error";
      const code = err.extensions.code || 500;
      const data = err.extensions.data;
      // return err;
      return {
        data,
        message,
        code,
      };
    },
  });

  await server.start();

  app.use(
    cors({
      origin: "*",
      methods: ["GET", "PUT", "POST", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  );

  app.use(bodyParser.json());

  app.use(auth);

  // Relationship Database
  User.hasMany(Donation);
  Donation.belongsTo(User);
  User.hasOne(Preference);
  Preference.belongsTo(User);

  app.use(
    "/graphql",
    expressMiddleware(server, {
      context: async ({ req, res }) => {
        return {
          isAuth: req.isAuth,
          userId: req.userId || "",
        };
      },
    })
  );

  app.use((error, req, res, next) => {
    console.log(error);
    const status = error.code || 500;
    const message = error.message;
    const data = error.data;
    res.status(status).json({ message: message, data: data });
  });

  try {
    await db.sync();
    console.log("Connected to the database");
    // const user = await User.findOne({ where: { email: "testing@email.com" }, include: Preference });
    // console.log(user.preference.dataValues);

    httpServer.listen({ port: process.env.PORT }, () => {
      console.log(`Server is running on port ${process.env.PORT}`);
    });
  } catch (error) {
    console.error("Error connecting to the database:", error);
  }
}

startServer();
