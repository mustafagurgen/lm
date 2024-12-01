const {router,prisma} = require('./router');
const {check, validationResult} = require('./validator');
const {responseSuccess, responseError} = require('../services/response')

// Get Role Data
router.get('/roles/:id',[
    check('id').isInt()
  ], async (req, res) => {

  const errors = validationResult(req);
  // console.log('Errors:', errors)

  if (!errors.isEmpty()) {
    return responseError(res,-1,errors.array(),400);
  }


  const role = await prisma.role.findFirst({
    select: {
      id: true,
      title:true,
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
    role: role
  });
});


// Get Roles
router.get('/roles', [
  check('page').isInt(),
  check('limit').isInt(),
], async (req, res) => {


  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return responseError(res,-1,errors.array(),400);
  }


  const results = await prisma.role.findMany({
    select: {
      id: true,
      title:true,
      createdAt:true,
      updatedAt:true
    },
    skip:(parseInt(req.query.page)-1) * parseInt(req.query.limit),
    take: parseInt(req.query.limit),
    where: {
      NOT:{
        title: undefined
      },
      ...(req.query.q) ? {
        title: {contains: req.query.q}
      } : undefined,
    },
    orderBy: {
      title: 'asc'
    },
  })


  return responseSuccess(res,null,{
    page: parseInt(req.query.page),
    limit: parseInt(req.query.limit),
    roles: results,
  });
});


router.post('/roles',[
  check('title').isLength({min:3})
], async (req, res) => {

  // TODO: Role option will be added later
  const { title } = req.body


  const errors = validationResult(req);


  if (!errors.isEmpty()) {
    return responseError(res,-1,errors.array(),400);
  }



  try {
    const role = await prisma.role.create({
      data: {
        title
      },
    })
    if (role) {
      return responseSuccess(
        res,'Role created successfully',{ role: role }, 200);
    }

  } catch (error) {
    return responseError(res,-1,error.message,400);
  }

});

module.exports = router;
