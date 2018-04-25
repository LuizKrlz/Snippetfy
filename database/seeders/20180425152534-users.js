const bcrypt = require('bcryptjs');

module.exports = {
  up: async (queryInterface) => {
    const password = await bcrypt.hash('123456', 5);

    return queryInterface.bulkInsert('Users', [{
      name: 'Teste User',
      email: 'testeuser@mail.com',
      password,
      createdAt: new Date(),
      updatedAt: new Date(),
    }], {});
  },

  down: (queryInterface) => {
    return queryInterface.bulkDelete('Users', null, {
      where: { email: 'testeuser@mail.com' },
    });
  },
};
