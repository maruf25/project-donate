const Donation = require("../models/DonationModels");
const User = require("../models/UserModels");
const Preference = require("../models/PreferenceModel");

exports.payment = async (donationId, status, pubsub) => {
  const donation = await Donation.findOne({
    where: { id: donationId },
    include: { model: User, include: { model: Preference } },
  });

  if (!donation) {
    throw new GraphQLError("Donation could not found", {
      extensions: { code: 404 },
    });
  }

  //   Cek payment success atau failed/cancel
  if (status === "SUCCESS") {
    donation.payment = "SUCCESS";
    await donation.save();

    // Tampilkan berdasarkan urutan
    await pubsub.publish("ALERT" + donation.user.stream_key, {
      donationCreated: {
        ...donation.dataValues,
        amount: donation.dataValues.amount.toString(),
      },
    });
  } else if (status === "FAILED" || status === "CANCEL") {
    await Donation.destroy({ where: { id: donationId } });

    return "FAILED";
  }

  return "SUCCESS";
};

exports.replayDonation = async (donationId, contextValue, pubsub) => {
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
  await pubsub.publish("ALERT" + donation.user.stream_key, {
    donationCreated: {
      ...donation.dataValues,
      amount: donation.dataValues.amount.toString(),
    },
  });
  return { ...donation.dataValues, amount: donation.dataValues.amount.toString() };
};
