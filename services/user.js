const {prisma} = require('../routes/router');

module.exports = {
  checkUserExists: async (userId) => {

      return new Promise(async (resolve, reject) => {
        const check = await prisma.user.findFirst({
          select: {
            id: true
          },
          where: {
            id: userId,
          },
          orderBy: {
            id: 'desc',
          },
        });

        if (!check) {
          return reject({ status: 404, message: 'User not found', });
        }
        return resolve({ status:200, data: check });
      });

  },

}