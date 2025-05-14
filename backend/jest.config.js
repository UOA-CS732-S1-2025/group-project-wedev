// jest.config.js
export default {
    transform: {
        "^.+\\.(js|jsx|mjs|ts|tsx)$": "babel-jest",
      },      
    testEnvironment: "node",
    setupFiles: ["dotenv/config"],

  };
  