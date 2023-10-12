module.exports = `
  type User {
    id: ID
    username: String
    email: String
    password : String
    stream_key : String
  }

  type Donation {
    id: ID!
    name: String!
    message: String!
    amount: String!
    createdAt: String!
  }

  type Preference{
    id: ID!
    background_color: String!
    color_text: String!
    highlight_color: String!
    template_text: String!
    duration: Int!
  }

  type AuthData {
    token: String!
    userId: String!
  }

  input UserInputData {
    username : String!
    email : String!
    password : String!
  }

  input DonationInputData{
    name: String!
    message: String!
    amount: String!
    username: String!
  }
  
  type Query {
    getUserByUsername(username:String!): Boolean!
    getUserById: User!
    getUserPreference(stream_key:String!): Preference!
    getDonations: [Donation]!
    testDonation: Boolean!
  }

  type Mutation {
    createUser(userInput:UserInputData): User!
    loginUser(email:String!,password:String!): AuthData!
    createDonation(donationInput: DonationInputData!): Donation!
    replayDonation(donationId: ID!): Donation!
  }

  type Subscription {
    donationCreated(stream_key:String!): Donation!
  }
`;
