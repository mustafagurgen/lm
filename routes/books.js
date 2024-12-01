const {router,prisma} = require('./router');
const {check, validationResult} = require('./validator');
const {responseSuccess, responseError} = require('../services/response')

// Get Book Data
router.get('/books/:id',[
    check('id').isInt()
  ], async (req, res) => {

  // console.log('Param:',req.params);
  const errors = validationResult(req);
  // console.log('Errors:', errors)

  if (!errors.isEmpty()) {
    return responseError(res,-1,errors.array(),400);
  }


  const book = await prisma.book.findFirst({
    select: {
      id: true,
      bookName:true,
      bookDescription:true,
      bookAuthor:true,
      createdAt:true,
      updatedAt:true
    },
    where: {
      id: parseInt(req.params.id),
    },
    orderBy: {
      id: 'desc',
    },
  })


  return responseSuccess(res,null,{
    book: book
  });
});


// Get Users
router.get('/books', [
  check('page').isInt(),
  check('limit').isInt(),
], async (req, res) => {


  const errors = validationResult(req);
  // console.log('Errors:', errors)

  if (!errors.isEmpty()) {
    return responseError(res,-1,errors.array(),400);
  }


  const results = await prisma.book.findMany({
    select: {
      id: true,
      bookName:true,
      bookDescription:true,
      bookAuthor:true,
      createdAt:true,
      updatedAt:true
    },
    skip:(parseInt(req.query.page)-1) * parseInt(req.query.limit),
    take: parseInt(req.query.limit),
    where: {
      NOT:{
        bookName: undefined
      },
      ...(req.query.q) ? {
        bookName: {contains: req.query.q}
      } : undefined,
    },
    orderBy: {
      bookName: 'asc',
    },
  })


  return responseSuccess(res,null,{
    page: parseInt(req.query.page),
    limit: parseInt(req.query.limit),
    users: results,
  });
});


router.post('/books',[
  check('bookName').isString().isLength({min:3}),
], async (req, res) => {

  const { bookName, bookAuthor, bookDescription, bookPublisher } = req.body

  const errors = validationResult(req);


  if (!errors.isEmpty()) {
    return responseError(res,-1,errors.array(),400);
  }


  try {
    const book = await prisma.book.create({
      data: {
        bookName,
        bookAuthor,
        bookDescription,
        bookPublisher
      },
    })
    if (book) {
      return responseSuccess(
        res,'Book created successfully',{ book: book }, 200);
    }

  } catch (error) {
    return responseError(res,-1,error.message,400);
  }

});

module.exports = router;
