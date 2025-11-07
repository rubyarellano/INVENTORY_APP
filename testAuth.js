const { registerUser, loginUser } = require('./auth');

loginUser("john.doe@example.com", "$2b$10$hashedPasswordHere");
