const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const JWTstrategy = require('passport-jwt').Strategy;
const ExtractJWT = require('passport-jwt').ExtractJwt;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const { User, School, SchoolCode } = require('../models/index');
//const makeJWT = require("../utils");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const SECRET_KEY = process.env.SECRET_KEY;

const BASE_URL = process.env.BASE_URL;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const FACEBOOK_ID = process.env.FACEBOOK_ID;
const FACEBOOK_SECRET = process.env.FACEBOOK_SECRET;

module.exports = function (passport) {
  passport.serializeUser(function (user, done) {
    // Ya tenemos la info del usuario, ahora sele dice a passport cómo vamos a identificar al usuario en la cookie (con el userId)
    done(null, user.id);
  });
  passport.deserializeUser(function (id, done) {
    // Acá nos traemos la info de la cookie, debemos buscar el resto de la información en la base de datos. Esto es lo que se pasará como req.user a la ruta
    User.findByPk(id)
      .then((user) => {
        done(null, user);
      })
      .catch((error) => {
        done(error, null);
      });
  });

  //Estrategia para registro de un nuevo usuario
  passport.use(
    'register-local',
    new LocalStrategy(
      {
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true,
      },
      async (req, email, password, done) => {
        try {
          const {
            firstName,
            lastName,
            email,
            birthdate,
            password,
            cellphone,
          } = req.body;

          const user_data = {
            firstName,
            lastName,
            email,
            birthdate,
            password,
            cellphone,
          };
          // console.log('user_data', user_data);
          const user = await User.create(user_data);
          //clonamos el objeto user, eliminamos el campo password y devolvemos el obj user
          let user_obj = { ...user.dataValues };
          delete user_obj.password;
          // console.log('REGISTER STRATEGY', user_obj);
          return done(null, user_obj);
        } catch (error) {
          console.error(error);
          return done(error);
        }
      }
    )
  );

  passport.use(
    'registerOrg-local',
    new LocalStrategy(
      {
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true,
      },
      async (req, email, password, done) => {
        try {
          const {
            name,
            email,
            password,
            country,
            city,
            description,
            logo,
            code,
          } = req.body;
          //console.log("ENTRÉ", email, password)

          var school_code = await SchoolCode.findOne({
            where: {
              email,
              code,
            },
          });
          // console.log('SCHOOL CODE', school_code);
          // if (mail y code no coinciden){
          //   return done(null, school_obj); // revisar como es cuando es error
          // }
          const school_data = {
            name,
            email,
            country,
            city,
            logo,
            description,
            password,
          };
          // console.log('school_data', school_data);
          const school = await School.create(school_data);
          // console.log('creada school', school);
          //clonamos el objeto user, eliminamos el campo password y devolvemos el obj user
          let school_obj = { ...school.dataValues };
          delete school_obj.password;
          await school_code.destroy();
          // console.log('REGISTER STRATEGY', user_obj);
          return done(null, school_obj);
        } catch (error) {
          console.error(error);
          return done(error);
        }
      }
    )
  );

  passport.use(
    /**
     * Estrategia para hacer login con email//pass
     * comparando contra la info de la db
     * devuelve un JWT para ser utilizado en la autenticacion con la estrategia JWT
     */
    'local-login',
    new LocalStrategy(
      {
        usernameField: 'email',
        passwordField: 'password',
        session: false,
      },
      async (email, password, done) => {
        try {
          const user = await User.findOne({ where: { email } });
          if (!user) {
            return done(null, false, { message: 'No se encontro el usuario' });
          }

          const match = await bcrypt.compare(password, user.password);

          if (!match) {
            return done(null, false, { message: 'Contraseña incorrecta' });
          }
          let user_obj = { ...user.dataValues };
          delete user_obj.password;

          return done(null, user_obj, { message: 'Login correcto' });
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  passport.use(
    'local-login-org',
    new LocalStrategy(
      {
        usernameField: 'email',
        passwordField: 'password',
        session: false,
      },
      async (email, password, done) => {
        try {
          const school = await School.findOne({ where: { email } });

          if (!school) {
            return done(null, false, {
              message: 'No se encontro la organización',
            });
          }

          const validate = await bcrypt.compare(
            password,
            school.password,
            (err, isMatch) => {
              if (err || !isMatch) {
                return done(null, false, { message: 'Contraseña Incorrecta' });
              }
              return done(null, school);
            }
          );
          // if (!validate) {
          //   return done(null, false, { message: "Contraseña incorrecta" });
          // }
          let school_obj = { ...school.dataValues };
          delete school_obj.password;

          return done(null, school_obj, { message: 'Login correcto' });
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  const cookieExtractor = (req) => {
    let token = null;
    if (req.signedCookies && req.signedCookies.refreshToken)
      token = req.signedCookies.refreshToken.token;
    return token;
  };

  //?Opciones de JWT
  const jwtCookies_options = {
    jwtFromRequest: cookieExtractor,
    secretOrKey: SECRET_KEY,
  };

  passport.use(
    'jwt-cookie',
    new JWTstrategy(jwtCookies_options, async (jwt_payload, done) => {
      console.log('jwtCookie_PAYLOAD', jwt_payload);
      try {
        const user = await User.findOne({
          where: { email: jwt_payload.sub },
        });
        if (!user) {
          return done(null, false, {
            message: 'No se encontro el usuario',
          });
        }
        let user_obj = { ...user.dataValues };
        delete user_obj.password;
        console.log('RETURN JWT', user_obj);
        return done(null, user_obj, { message: 'Token Autorizado' });
      } catch (error) {
        return done('CATCHING', error);
      }
    })
  );

  //?Opciones de JWT
  const jwt_options = {
    jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
    secretOrKey: SECRET_KEY,
  };
  //*estrategia para login con JWT
  passport.use(
    'jwt',
    new JWTstrategy(jwt_options, async (jwt_payload, done) => {
      let id = jwt_payload.id;
      let authData = jwt_payload.user;
      let user;
      try {
        if (authData.type === 'school') {
          user = await School.findByPk(id);
          const userByEmail = await School.findOne({
            where: { email: authData.email },
          });
          if (user.id !== userByEmail.id) {
            return done(null, false, {
              message: 'incongruencia entre la data del token',
            });
          }
        } else {
          user = await User.findByPk(id);
          const userByEmail = await User.findOne({
            where: { email: authData.email },
          });
          if (user.id !== userByEmail.id) {
            return done(null, false, {
              message: 'incongruencia entre la data del token',
            });
          }
        }
        // const user = await User.findOne({
        //   where: { email: jwt_payload.user.email },
        // });
        // console.log('USER JWT', user);
        if (!user) {
          return done(null, false, { message: 'No se encontro el usuario' });
        }
        let user_obj = { ...user.dataValues };
        delete user_obj.password;
        return done(null, user_obj, { message: 'Token Autorizado' });
      } catch (error) {
        return done(error);
      }
    })
  );

  // Estrategia para schools

  passport.use(
    'jwt-school',
    new JWTstrategy(jwt_options, async (jwt_payload, done) => {
      try {
        const school = await School.findOne({
          where: { email: jwt_payload.school.email },
        });
        if (!school) {
          return done(null, false, {
            message: 'No se encontro la organización',
          });
        }
        let school_obj = { ...school.dataValues };
        delete school_obj.password;
        // console.log('RETURN JWT', school_obj);
        return done(null, school_obj, { message: 'Token Autorizado' });
      } catch (error) {
        return done(error);
      }
    })
  );

  const refreshCookieExtractor = (req) => {
    let token = null;
    if (req.signedCookies && req.signedCookies.refreshToken)
      token = req.signedCookies.refreshToken.token;
    return token;
  };

  const jwtRefresh_options = {
    jwtFromRequest: refreshCookieExtractor,
    secretOrKey: SECRET_KEY,
  };
  //*Refresh strategy
  passport.use(
    'jwt-refresh',
    new JWTstrategy(jwtRefresh_options, async (jwt_payload, done) => {
      try {
        return done(null, jwt_payload.user, { message: 'Token Autorizado' });
      } catch (error) {
        console.error('CATCHING REFRESH');
        return done(error);
      }
    })
  );

  passport.use(
    'google',
    new GoogleStrategy(
      {
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: BASE_URL + 'auth/google/callback',
        passReqToCallback: true,
        // scope: ['email'],
      },
      async (req, accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails[0].value;
          let user = await User.findOne({ where: { email } }); //buscamos el email que devuelve google
          // si no hay user entonces creamos uno con datos `default`
          // si encontramos un user, entonces solamente devolvemos ese user
          if (!user) {
            const { _json: extra, displayName } = profile;
            const [firstName, lastName] = displayName.split(/(?<=^\S+)\s/);
            const password = String(Date.now() + Math.random()).substring(0, 7);
            const birthdate = new Date('01-01-1500');
            const cellphone = 115100;
            const user_data = {
              firstName,
              lastName: lastName || firstName,
              email,
              birthdate,
              password,
              cellphone,
            };
            const new_user = await User.create(user_data);
            // console.log('newUser', new_user);
            if (!new_user)
              return done(null, false, {
                message: 'No se pudo crear el usuario',
              });
            user = new_user;
          }
          let user_obj = { ...user.dataValues, accessToken };
          delete user_obj.password;
          return done(null, user_obj);
        } catch (error) {
          return done('CATCHING', error);
        }
      }
    )
  );
};

passport.use(
  'facebook',
  new FacebookStrategy(
    {
      clientID: FACEBOOK_ID,
      clientSecret: FACEBOOK_SECRET,
      callbackURL: BASE_URL + 'auth/facebook/callback',
      profileFields: ['id', 'emails', 'displayName', 'photos'],
      passReqToCallback: true,
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        // console.log('profile', profile);
        let { displayName, emails } = profile;
        const email = emails[0].value;
        // console.log('email', email);
        let user = await User.findOne({ where: { email } }); //buscamos el email que devuelve google
        // si no hay user entonces creamos uno con datos `default`
        // si encontramos un user, entonces solamente devolvemos ese user
        if (!user) {
          const [firstName, lastName] = displayName.split(/(?<=^\S+)\s/);
          const password = String(Date.now() + Math.random()).substring(0, 7);
          const birthdate = new Date('01-01-1500');
          const cellphone = 115100;
          const user_data = {
            firstName,
            lastName,
            email,
            birthdate,
            password,
            cellphone,
          };
          // console.log('user_data', user_data);
          const new_user = await User.create(user_data);
          // console.log('newUser', new_user);
          if (!new_user)
            return done(null, false, {
              message: 'No se pudo crear el usuario',
            });
          user = new_user;
        }
        let user_obj = { ...user.dataValues, accessToken };
        delete user_obj.password;
        return done(null, user_obj);
      } catch (error) {
        return done('CATCHING FACEBOOK', error);
      }
    }
  )
);
