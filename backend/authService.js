// In-memory user store (simulates a database)
const userStore = {
  'demo@medbuddy.com': { name: 'Demo User', email: 'demo@medbuddy.com', password: 'demo123' },
  'patient@example.com': { name: 'John Doe', email: 'patient@example.com', password: 'patient123' },
  'doctor@hospital.com': { name: 'Dr. Smith', email: 'doctor@hospital.com', password: 'doctor123' }
};

module.exports = {
  login: async (email, password) => {
    const user = userStore[email.toLowerCase()];
    if (!user) {
      throw new Error('No account found with this email. Please sign up.');
    }
    if (user.password !== password) {
      throw new Error('Incorrect password. Please try again.');
    }
    return { name: user.name, email: user.email };
  },

  signup: async (name, email, password) => {
    if (userStore[email.toLowerCase()]) {
      throw new Error('This email is already registered.');
    }
    userStore[email.toLowerCase()] = { name, email, password };
    return { name, email };
  }
};
