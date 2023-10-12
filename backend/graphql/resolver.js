const { GraphQLError } = require("graphql");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const validator = require("validator");
const { v4: uuidv4 } = require("uuid");
require("dotenv").config();
const { PubSub } = require("graphql-subscriptions");

const pubsub = new PubSub();

const User = require("../models/UserModels");
const Preference = require("../models/PreferenceModel");
const Donation = require("../models/DonationModels");

module.exports = {
  Query: {
    getUserByUsername: async (_, { username }) => {
      const user = await User.findOne({ where: { username } });
      if (!user) {
        throw new GraphQLError("User could not found", {
          extensions: { code: "INVALID_USERNAME" },
        });
      }
      return true;
    },
    getUserById: async (_, args, contextValue) => {
      if (!contextValue.isAuth) {
        throw new GraphQLError("Not Authenticated", {
          extensions: { code: "NOT_AUTHENTICATED" },
        });
      }
      const userId = contextValue.userId;
      const user = await User.findByPk(userId);
      if (!user) {
        throw new GraphQLError("User doesn't exist", {
          extensions: { code: 404 },
        });
      }
      return user;
    },
    getDonations: async (_, args, contextValue) => {
      if (!contextValue.isAuth) {
        throw new GraphQLError("Not Authenticated", {
          extensions: { code: "NOT_AUTHENTICATED" },
        });
      }
      const userId = contextValue.userId;

      console.log(userId);

      const donations = await Donation.findAll({ where: { userId } });

      const options = {
        // weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
      };

      return donations.map((donation) => {
        return {
          ...donation.dataValues,
          createdAt: donation.dataValues.createdAt.toLocaleDateString(undefined, options),
        };
      });
    },

    testDonation: (parent, args, contextValue) => {
      pubsub.publish("ALERT_SHOW", {
        donationCreated: {
          name: "Testing Name",
          message: "Ini Testing",
          amount: "10.000",
        },
      });
      return true;
    },
    getUserPreference: async (parent, { stream_key }, contextValue) => {
      // if (!contextValue.isAuth) {
      //   throw new GraphQLError("Not Authenticated", {
      //     extensions: { code: 401 },
      //   });
      // }
      // const userId = contextValue.userId;
      // const preferences = await Preference.findOne({ where: { userId } });
      const user = await User.findOne({ where: { stream_key }, include: Preference });
      if (!user) {
        throw new GraphQLError("Preference can't found ", {
          extensions: { code: 404 },
        });
      }
      return user.preference;
    },
  },
  Mutation: {
    createUser: async (_, { userInput }, contextValue, info) => {
      const email = userInput.email;
      const password = userInput.password;
      const username = userInput.username;

      const errors = [];
      // Validasi setiap input
      if (!validator.isEmail(email)) {
        errors.push({ message: "Email is invalid", path: "email" });
      }
      if (validator.isEmpty(password) || !validator.isLength(password, { min: 6 })) {
        errors.push({ message: "Password to short", path: "password" });
      }
      if (validator.contains(username, " ")) {
        errors.push({ message: "Username can't contain space", path: "username" });
      }
      if (errors.length > 0) {
        // throw new Error("Invalid Input");
        const error = new GraphQLError("Invalid input", {
          extensions: {
            code: "BAD_USER_INPUT",
            data: errors,
            // http: {
            //   status: 422,
            // },
          },
        });
        throw error;
      }

      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        throw new GraphQLError("User already exist", {
          extensions: { code: 409 },
        });
      }
      const hashPw = await bcrypt.hash(password, 12);
      const user = await User.create({
        email,
        password: hashPw,
        username,
        stream_key: uuidv4(),
      });
      const preference = await Preference.create();
      await user.setPreference(preference);
      return user;
    },
    loginUser: async (_, { email, password }, contextValue, info) => {
      const user = await User.findOne({ where: { email } });
      if (!user) {
        console.log("error email");
        throw new GraphQLError("User not found", {
          extensions: { code: 401 },
        });
      }
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        throw new GraphQLError("Password is incorrect", {
          extensions: { code: 401 },
        });
      }
      const token = jwt.sign(
        {
          userId: user.id,
          email: user.email,
        },
        process.env.SECRET_KEY,
        { expiresIn: "1h" }
      );
      return {
        token,
        userId: user.id,
      };
    },
    createDonation: async (_, { donationInput }, { req }, info) => {
      const username = donationInput.username;
      const name = donationInput.name;
      const message = donationInput.message;
      const amount = donationInput.amount;
      const errors = [];
      if (validator.isEmpty(name)) {
        errors.push({ message: "Name is invalid", path: "name" });
      }
      if (validator.isEmpty(amount) || !validator.isLength(amount, { min: 4 })) {
        errors.push({ message: "Amount is invalid", path: "amount" });
      }
      if (errors.length > 0) {
        const error = new GraphQLError("Invalid input", {
          extensions: {
            code: "BAD_USER_INPUT",
            data: errors,
          },
        });
        throw error;
      }
      const user = await User.findOne({ where: { username }, include: Preference });
      const donation = await Donation.create({
        name,
        message,
        amount: parseFloat(amount),
        userId: user.id,
      });
      // console.log(user.preference.duration);

      // Tampilkan berdasarkan urutan
      setTimeout(() => {
        pubsub.publish("ALERT" + user.stream_key, {
          donationCreated: {
            ...donation.dataValues,
            amount: donation.dataValues.amount.toString(),
          },
        });
      }, user.preference.duration);

      return { ...donation.dataValues, amount: donation.dataValues.amount.toString() };
    },
    replayDonation: async (_, { donationId }, contextValue, info) => {
      if (!contextValue.isAuth) {
        throw new GraphQLError("Not Authenticated", {
          extensions: { code: "NOT_AUTHENTICATED" },
        });
      }
      const userId = contextValue.userId;
      const donation = await Donation.findOne({
        where: { id: donationId },
        include: { model: User, include: { model: Preference } },
      });
      if (donation.user.id !== userId) {
        throw new GraphQLError("Not Authorized", {
          extensions: { code: "NOT_AUTHORIZED" },
        });
      }
      if (!donation) {
        throw new GraphQLError("Donation could not found", {
          extensions: { code: 404 },
        });
      }

      // console.log(donation.user.preference.duration);

      // Tampilkan berdasarkan urutan
      pubsub.publish("ALERT" + donation.user.stream_key, {
        donationCreated: {
          ...donation.dataValues,
          amount: donation.dataValues.amount.toString(),
        },
      });
      return { ...donation.dataValues, amount: donation.dataValues.amount.toString() };
    },
  },
  Subscription: {
    donationCreated: {
      subscribe: (_, { stream_key }) => pubsub.asyncIterator(["ALERT" + stream_key]),
    },
  },
};
