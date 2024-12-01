const {prisma} = require('../routes/router');

module.exports = {
  checkBookExists: async (bookId) => {

      return new Promise(async (resolve, reject) => {
        const check = await prisma.user.findFirst({
          select: {
            id: true
          },
          where: {
            id: bookId,
          },
          orderBy: {
            id: 'desc',
          },
        });

        if (!check) {
          return reject({ status: 404, message: 'Book not found', });
        }
        return resolve({ status:200, data: check });
      });

  },

  checkBookUserBorrow: async (bookId,userId, shouldExists = false) => {

    return new Promise(async (resolve, reject) => {
      const check = await prisma.borrow.findFirst({
        select: {
          id: true
        },
        where: {
          bookId: bookId,
          userId: userId
        },
        orderBy: {
          id: 'desc',
        },
      });

      if (shouldExists) {
        if (!check) {
          return reject({ status: 400, message: 'Book was not borrowed by the user!', });
        }
        return resolve({ status:200, data: check });

      }

      if (check) {
        return reject({ status: 404, message: 'Book already borrowed by the user!', });
      }
      return resolve({ status:200, data: check });
    });

  },

}