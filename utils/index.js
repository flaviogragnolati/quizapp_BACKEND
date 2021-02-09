const SECRET_KEY = process.env.SECRET_KEY;
const jwt = require('jsonwebtoken');

const capitalize = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

const makeJWT = (user) => {
  /**
   * func para crear un jw token
   * recibe user y devuelve un token con la info del user
   */
  const { id } = user;

  const payload = {
    id,
    user,
    iat: Date.now(),
    issuer: 'QuizzApp',
    audience: 'localhost:3000',
  };

  const options = {}; //por si necesitamos pasarle opciones adicionales al token, por ahora...nada

  const signedToken = jwt.sign(payload, SECRET_KEY, options);
  const BearerToken = `Bearer ${signedToken}`;
  return BearerToken;
};

const makeid = (length) => {
  var result = '';
  var characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

const paginate = (query, { page, pageSize }) => {
  const offset = page * pageSize;
  const limit = pageSize;

  return {
    ...query,
    offset,
    limit,
  };
};

exports.capitalize = capitalize;
exports.makeJWT = makeJWT;
exports.makeid = makeid;
exports.paginate = paginate;
