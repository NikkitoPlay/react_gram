const User = require("../models/User");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { default: mongoose } = require("mongoose");

const jwtSecret = process.env.JWT_SECRET;

//generate user token
const generateToken = (id) => {
  return jwt.sign({ id }, jwtSecret, { expiresIn: "7d" });
};

const register = async (req, res) => {
  const { name, email, password } = req.body;

  //check se usuario existe
  const user = await User.findOne({ email });

  if (user) {
    res.status(422).json({ errors: ["Por favor, utilize outro email"] });
    return;
  }

  // generate password hash
  const salt = await bcrypt.genSalt();
  const passwordHash = await bcrypt.hash(password, salt);

  //
  const newUser = await User.create({
    name,
    email,
    password: passwordHash,
  });

  //se usuario foi criado com sucesso
  if (!newUser) {
    res
      .status(422)
      .json({ errors: ["Por favor, tente novamente mais tarde."] });
    return;
  }

  res.status(201).json({ _id: newUser._id, token: generateToken(newUser._id) });
};

//login do usuario
const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    res.status(404).json({ errors: ["Usuário não encontrado."] });
    return;
  }

  //check if password matches
  if (!(await bcrypt.compare(password, user.password))) {
    res.status(422).json({ errors: ["A senha está errada."] });
    return;
  }

  //retorn usuário com token
  res.status(201).json({
    _id: user._id,
    profileImage: user.profileImage,
    token: generateToken(user._id),
  });
};

//recuperar usuário logado
const getCurrentUser = async (req, res) => {
  const user = req.user;

  res.status(200).json(user);
};

const update = async (req, res) => {
  const { name, password, bio } = req.body;
  let profileImage = null;

  if (req.file) {
    profileImage = req.file.filename;
  }

  const user = await User.findById(mongoose.Types.ObjectId(req.user._id));

  if (name) {
    user.name = name;
  }

  if (password) {
    // generate password hash
    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(password, salt);

    user.password = passwordHash;
  }

  if (profileImage) {
    user.profileImage = profileImage;
  }

  if (bio) {
    user.bio = bio;
  }

  await user.save();

  res.status(200).json(user)
};

module.exports = { register, login, getCurrentUser, update };
