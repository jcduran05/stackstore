module.exports = {
  "DATABASE_URI": "postgres://localhost:5432/fsg",
  "SESSION_SECRET": "Optimus Prime is my real dad",
  "TWITTER": {
    "consumerKey": "oZFm5vMUG0PlZbBTaUyDvin4B",
    "consumerSecret": "psi5Qr8Y2Isa3Il9K2lnaxti9ahrZmw1ifXgI8dNEJQq2NqXoT",
    "callbackUrl": "http://127.0.0.1:1337/auth/twitter/callback"
  },
  "FACEBOOK": {
    "clientID": "INSERT_FACEBOOK_CLIENTID_HERE",
    "clientSecret": "INSERT_FACEBOOK_CLIENT_SECRET_HERE",
    "callbackURL": "INSERT_FACEBOOK_CALLBACK_HERE"
  },
  "GOOGLE": {
    "clientID": "682775662196-mv4nc2gd6sbi6ors1kde38et838dticl.apps.googleusercontent.com",
    "clientSecret": "wz4Ye8Uc9w9S1RX3jYNcTzfP",
    "callbackURL": "http://localhost:1337/auth/google/callback"
  },
  "STRIPE": {
    "testSecretKey": "sk_test_Xl8aPq2pTuHPSsUHJJLoeHhk",
    "testPublicKey": "pk_test_i9QeHVWyjSlZlAOEqEHZmLzl"
  },
  "LOGGING": true
};
