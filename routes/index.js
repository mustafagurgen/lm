const {app,router,prisma} = require('./router');

const roles = require('./roles');
const users = require('./users');
const books = require('./books');

// router.use((req, res, next) => {
//   if (!req.headers['x-auth']) return next('router')
//   next();
// })

router.use((req, res, next) => {
  console.log('Time:', Date.now())
  next()
})

router.use('/roles', roles);
router.use('/users', users);
router.use('/books', books);

router.get('/test', async (req, res) => {

  res.json({
    success:true,
    message: 'Test endpoint working'
  })
})



router.get('/feed', async (req, res) => {
  const posts = await prisma.post.findMany({
    where: { published: true },
    include: { author: true },
  })
  res.json(posts)
})

router.post('/post', async (req, res) => {
  const { title, content, authorEmail } = req.body
  const post = await prisma.post.create({
    data: {
      title,
      content,
      published: false,
      author: { connect: { email: authorEmail } },
    },
  })
  res.json(post)
})

router.put('/publish/:id', async (req, res) => {
  const { id } = req.params
  const post = await prisma.post.update({
    where: { id },
    data: { published: true },
  })
  res.json(post)
})

router.delete('/user/:id', async (req, res) => {
  const { id } = req.params
  const user = await prisma.user.delete({
    where: {
      id,
    },
  })
  res.json(user)
})


app.use('/v1',router);


module.exports = app;
