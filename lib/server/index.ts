import 'dotenv/config';
import * as http from 'http';
import * as express from 'express';
import { ApolloServer, makeExecutableSchema } from 'apollo-server-express';
import typeDefs from './schema';
import * as path from 'path';
import resolvers from './resolvers';
import * as dotenv from 'dotenv';
import { GlobalContext } from './model/types';
import { MongoClient } from 'mongodb'
import { DataProvider } from './dataProvider';
import * as passport from 'passport';
import { OAuth2Strategy as GoogleStrategy } from 'passport-google-oauth';
import * as expressSession from 'express-session';
import { ensureLoggedIn } from 'connect-ensure-login';
import * as MemoryStoreFactory from 'memorystore'
import { Profile } from 'passport';
import * as cors from 'cors';
import { User } from './_graphql/types';
import { ExpressContext } from 'apollo-server-express/dist/ApolloServer';
import { AuthDirective } from './schemaDirectives/auth';

const start = async () => {
  try {
    dotenv.config({
      path: `.env.${process.env.NODE_ENV}`,
    });

    dotenv.config({
      path: `.env.${process.env.NODE_ENV}.local`,
    });
    const isProd = process.env.NODE_ENV === 'production';
    const serverUrl = process.env.SERVER_URL;
    const clientUrl = process.env.CLIENT_URL;
    const clientPath = "../src/build";
    const dbConnection = process.env.DB_CONNECTION;
    const googleClientId = process.env.GOOGLE_CLIENT_ID;
    const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const port = process.env.PORT || 8000;
    const mongoConnection = await MongoClient.connect(dbConnection, { useNewUrlParser: true, useUnifiedTopology: true });
    const mongodb = mongoConnection.db(process.env.MONGO_DB);
    const dataProvider = new DataProvider(mongodb);

    const schema = makeExecutableSchema({
      typeDefs,
      resolvers,
      schemaDirectives: {
        auth: AuthDirective
      }
    });

    const server = new ApolloServer({
      schema: schema,
      context: async (expressContext: ExpressContext) => {
        const req: express.Request = expressContext.req;
        return <GlobalContext>{
          db: dataProvider,
          currentUser: req.user
        };
      }
    });

    const app = express();
    setupAuthAndSession(app, serverUrl, clientUrl, dataProvider, isProd, googleClientId, googleClientSecret);

    server.applyMiddleware({ app, cors: false });
    const httpServer = http.createServer(app);

    httpServer.listen({ port: port }, () =>
      console.log(`🚀 Server ready at ${serverUrl}${server.graphqlPath}`)
    );

    console.log(path.join(__dirname, clientPath));
    app.use('/', express.static(path.join(__dirname, clientPath)));


    app.get("/hello", (req, res) => {
      let text = `<html><body><h1>Welcome to idiomatically!</h1>`;
      if (req.user) {
        text += `<h3>Welcome back, ${(req.user as any).name}</h3>`;
      }
      text += "</body></html>";

      res.send(text);
    });

    app.get("/admin", ensureLoggedIn('/auth/google'), (req, res) => {
      res.send('Admin eyes only!');
    });

    // GET /auth/google
    //   Use passport.authenticate() as route middleware to authenticate the
    //   request.  The first step in Google authentication will involve
    //   redirecting the user to google.com.  After authorization, Google
    //   will redirect the user back to this application at /auth/google/callback
    app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email', 'openid'] }));

    // GET /auth/google/callback
    //   Use passport.authenticate() as route middleware to authenticate the
    //   request.  If authentication fails, the user will be redirected back to the
    //   login page.  Otherwise, the primary route function function will be called,
    //   which, in this example, will redirect the user to the home page.
    app.get('/auth/google/callback',
      passport.authenticate('google', { failureRedirect: '/login' }),
      (req, res) => {
        res.redirect(req.session.returnTo || clientUrl);
      });

    app.post('/logout', function (req, res) {
      req.logout();
      req.session.destroy((err) => {
        res.redirect('/');
      })
    });


  } catch (e) {
    console.error(e);
  }
};

start();

function setupAuthAndSession(app: express.Application, serverUrl: string, clientUrl: string, dataProvider: DataProvider, isProd: boolean, googleClientId: string, googleClientSecret: string) {

  // Use the GoogleStrategy within Passport.
  //   Strategies in Passport require a `verify` function, which accept
  //   credentials (in this case, an accessToken, refreshToken, and Google
  //   profile), and invoke a callback with a user object.
  passport.use(new GoogleStrategy({
    clientID: googleClientId,
    clientSecret: googleClientSecret,
    callbackURL: `${serverUrl}/auth/google/callback`,
  }, function (accessToken, refreshToken, profile, done) {
    done(null, profile);
  }));

  // Configure Passport authenticated session persistence.
  //
  // In order to restore authentication state across HTTP requests, Passport needs
  // to serialize users into and deserialize users out of the session.  In a
  // production-quality application, this would typically be as simple as
  // supplying the user ID when serializing, and querying the user record by ID
  // from the database when deserializing.  However, due to the fact that this
  // example does not have a database, the complete Facebook profile is serialized
  // and deserialized.
  passport.serializeUser<Profile, string>(async (profile, cb) => {
    const user = await dataProvider.ensureUserFromLogin(profile)
    cb(null, user.id);
  });
  passport.deserializeUser<User, string>(async (userId, cb) => {
    const user = await dataProvider.getUser(userId);
    cb(null, user);
  });

  const sessionLength = 7 * 24 * 60 * 60 * 1000; // 7 days
  const SessionMemoryStore = MemoryStoreFactory(expressSession);
  const sessionOptions: expressSession.SessionOptions = {
    // Random guid formatted with "N"
    secret: 'f60262180a5f481b8564318be9cb3ce6',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      maxAge: sessionLength
    },
    store: new SessionMemoryStore({
      checkPeriod: sessionLength
    }),
  };
  if (isProd) {
    app.set('trust proxy', 1); // trust first proxy
    sessionOptions.cookie.secure = true; // serve secure cookies
  }

  const corsOptions = {
    origin: clientUrl,
    credentials: true
  };
  app.use(cors(corsOptions));

  app.use(expressSession(sessionOptions));
  app.use(passport.initialize());
  app.use(passport.session());
}