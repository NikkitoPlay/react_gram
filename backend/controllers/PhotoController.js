const Photo = require("../models/Photo");
const User = require("../models/User");

const mongoose = require("mongoose");

//insert a photo with a user
const insertPhoto = async (req, res) => {
  const { title } = req.body;
  const image = req.file.filename;

  const reqUser = req.user;

  const user = await User.findById(reqUser._id);

  //console.log(user.name)
  //create a photo
  const newPhoto = await Photo.create({
    image,
    title,
    userId: user._id,
    userName: user.name,
  });

  if (!newPhoto) {
    res.status(422).json({
      errors: ["Houve um problema, tente novamente mais tarde."],
    });
    return;
  }

  res.status(201).json(newPhoto);
};

//delete a photo
const deletePhoto = async (req, res) => {
  const { id } = req.params;
  const reqUser = req.user;

  try {
    const photo = await Photo.findById(new mongoose.Types.ObjectId(id));

    //verifica se a foto existe
    if (!photo) {
      res.status(404).json({ errors: ["Foto não encontrada."] });
      return;
    }

    //verifica se a foto pertence ao usuário
    if (!photo.userId.equals(reqUser._id)) {
      res
        .status(422)
        .json({ errors: ["Ocorreu um erro, tente novamente mais tarde."] });
      return;
    }

    await Photo.findByIdAndDelete(photo._id);

    res
      .status(200)
      .json({ id: photo._id, message: "Foto excluída com sucesso!" });
  } catch (error) {
    res.status(404).json({ errors: ["Foto não encontrada."] });
    return;
  }
};

//pegar todas as fotos
const getAllPhotos = async (req, res) => {
  const photos = await Photo.find({})
    .sort([["createdAt", -1]])
    .exec();
  return res.status(200).json(photos);
};

//pegar fotos de um usuario
const getUserPhotos = async (req, res) => {
  const { id } = req.params;

  const photos = await Photo.find({ userId: id })
    .sort([["createdAt", -1]])
    .exec();

  return res.status(200).json(photos);
};

//pegar fotos por id
const getPhotosById = async (req, res) => {
  const { id } = req.params;

  const photo = await Photo.findById(new mongoose.Types.ObjectId(id));

  //verifica se foto existe
  if (!photo) {
    res.status(404).json({ errors: ["Foto não encontrada."] });
    return;
  }

  return res.status(200).json(photo);
};

//atualizar uma foto
const updatePhoto = async (req, res) => {
  const { id } = req.params;
  const { title } = req.body;
  const reqUser = req.user;

  let photo = await Photo.findById(id);

  //verifica se foto existe
  if (!photo) {
    return res.status(404).json({ errors: ["Foto não encontrada!"] });
  }

  //verifica se foto pertence ao usuario
  if (!photo.userId.equals(reqUser._id)) {
    return res
      .status(422)
      .json({ errors: ["Houve um erro, tente mais tarde!"] });
  }

  if (title) {
    photo.title = title;
  }

  await photo.save();
  return res
    .status(200)
    .json({ photo, message: "Foto atualizada com sucesso!" });
};

//like functionality
const likePhoto = async (req, res) => {
  const { id } = req.params;
  const reqUser = req.user;

  const photo = await Photo.findById(id);

  //verifica se foto existe
  if (!photo) {
    return res.status(404).json({ errors: ["Foto não encontrada!"] });
  }

  //verifica se já há curtida do usuário
  if (photo.likes.includes(reqUser._id)) {
    res.status(422).json({ errors: ["Você já curtiu essa foto. "] });
  }

  //colocar id usuario no array de likes
  photo.likes.push(reqUser._id);
  await photo.save();

  res
    .status(200)
    .json({ photoId: id, userId: reqUser._id, message: "A foto foi curtida!" });
};

//funcionalidade de comentar
const commentPhoto = async(req, res) => {
  const {id} = req.params;
  const {comment} = req.body;
  const reqUser = req.user;

  const user = await User.findById(reqUser._id);

  const photo = await Photo.findById(id);

  //verifica se foto existe
  if (!photo) {
    return res.status(404).json({ errors: ["Foto não encontrada!"] });
  }

  //coloca o comentario no array 
  const userComment = {
    comment,
    userName: user.name,
    userImage: user.profileImage,
    userId: user._id
  }

  photo.comments.push(userComment)
  await photo.save();


  res.status(200).json({
    comment: userComment,
    message: 'O comentário foi adicionado com sucesso.'
  })
}

//busca imagens pelo titulo
const searchPhotos = async(req,res) => {
  const {q} = req.query;

  const photos = await Photo.find({title: new RegExp(q, "i")}).exec()

  res.status(200).json(photos);
}


module.exports = {
  insertPhoto,
  deletePhoto,
  getAllPhotos,
  getUserPhotos,
  getPhotosById,
  updatePhoto,
  likePhoto,
  commentPhoto,
  searchPhotos,
};
