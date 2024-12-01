const {router,prisma} = require('./router');
const {check, validationResult} = require('./validator');
const {responseSuccess, responseError} = require('../services/response');
const { checkBookExists, checkBookUserBorrow } = require('../services/book');
const { checkUserExists } = require('../services/user');
const moment = require('moment/moment');



// Get User Data
router.get('/users/:id',[
    check('id').isInt()
  ], async (req, res) => {

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return responseError(res,-1,errors.array(),400);
  }

  const user = await prisma.user.findFirst({
    select: {
      id: true,
      firstname:true,
      lastname:true,
      email:true,
      createdAt:true,
      updatedAt:true,
      scores:true,
      borrows:true
    },
    where: {
      id: parseInt(req.params.id),
    },
    orderBy: {
      id: 'desc',
    },
  })

  return responseSuccess(res,null,{
    user: user
  });
});


// Get Users
router.get('/users', [
  check('page').isInt(),
  check('limit').isInt(),
], async (req, res) => {


  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return responseError(res,-1,errors.array(),400);
  }


  const results = await prisma.user.findMany({
    select: {
      id: true,
      firstname:true,
      lastname:true,
      email:true,
      createdAt:true,
      updatedAt:true
    },
    skip:(parseInt(req.query.page)-1) * parseInt(req.query.limit),
    take: parseInt(req.query.limit),
    where: {
      NOT:{
        email: undefined
      },
      ...(req.query.q) ? {
        email: {contains: req.query.q}
      } : undefined,
    },
    orderBy: {
      firstname: 'asc'
    },
  })


  return responseSuccess(res,null,{
    page: parseInt(req.query.page),
    limit: parseInt(req.query.limit),
    users: results,
  });
});


router.post('/users',[
  check('email').isEmail(),
  check('password').isLength({min:5})
], async (req, res) => {

  // TODO: Role option will be added later
  const { firstname, lastname, email, password, roleId} = req.body


  const errors = validationResult(req);


  if (!errors.isEmpty()) {
    return responseError(res,-1,errors.array(),400);
  }

  try {
    const user = await prisma.user.create({
      data: {
        firstname,
        lastname,
        email,
        password // TODO: If there is enough time, bcrypt will also be added.
      },
    })
    if (user) {
      return responseSuccess(
        res,'User created successfully',{ user: user }, 200);
    }

  } catch (error) {
    return responseError(res,-1,error.message,400);
  }

});

// borrow
router.post('/users/:userId/borrow/:bookId',[
  check('userId').isInt(),
  check('bookId').isInt()
], async (req, res) => {

  console.log('Params ', req.params);

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return responseError(res,-1,errors.array(),400);
  }

  const userId = parseInt(req.params.userId);
  const bookId = parseInt(req.params.bookId);
  try {

    const checkBookDetail = await checkBookExists(bookId);
    if (!checkBookDetail) {
      return responseError(res,-1,'Book not found!',404);
    }

    const checkUserDetail = await checkUserExists(userId);
    if (!checkUserDetail) {
      return responseError(res,-1,'User not found!',404);
    }


    const checkBorrowDetail = await checkBookUserBorrow(bookId,userId, false);
    if (!checkBorrowDetail) {
      return responseError(res,-1,'Book borrowed by the user before!',400);
    }

    const borrow = await prisma.borrow.create({
      data: {
        userId,
        bookId
      },
    });
    if (borrow) {
      return responseSuccess(
        res,'User borrowed the book successfully',{ borrow: borrow }, 200);
    }

  } catch (error) {
    return responseError(res,-1,error.message,400);
  }

});


// return
router.post('/users/:userId/return/:bookId',[
  check('userId').isInt(),
  check('bookId').isInt(),
  check('score').isNumeric(),
], async (req, res) => {

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return responseError(res,-1,errors.array(),400);
  }

  const userId = parseInt(req.params.userId);
  const bookId = parseInt(req.params.bookId);

  try {

    const checkBookDetail = await checkBookExists(bookId).catch(e => e);

    if (checkBookDetail.status !== 200 ) {
      return responseError(res,-1,checkBookDetail.message,checkBookDetail.status);
    }

    const checkUserDetail = await checkUserExists(userId);
    if (checkUserDetail.status !== 200) {
      return responseError(res,-1,checkUserDetail.message,checkUserDetail.status);
    }

    const checkBorrowDetail = await checkBookUserBorrow(bookId,userId,true);


    if (checkBorrowDetail.status !== 200) {
      return responseError(res,-1,checkBorrowDetail.message,checkBorrowDetail.status);
    }

    await prisma.$transaction(async (tx) => {
      const borrow = await prisma.borrow.update({
        where: {
          id: checkBorrowDetail.data.id,
          returnedAt: undefined
        },
        data: {
          returnedAt: moment().format("YYYY-MM-DDTHH:mm:ssZ")
        },
      });
      if (!borrow) {
        return responseError(res,-1,"Returning book failed!",400);
      }

      const userScore = parseFloat(req.body.score);
      const borrowId = borrow.id;

      const score = await prisma.score.create({
        data: {
          userId,
          bookId,
          borrowId,
          userScore
        },
      });

      return responseSuccess( res,'User returned the book successfully',{ borrow: borrow, score: score }, 200);

    }).catch(e => {
      return responseError(res,-1,e.message,401);
    })

  } catch (error) {
    return responseError(res,-1,error.message,405);
  }

});

module.exports = router;
