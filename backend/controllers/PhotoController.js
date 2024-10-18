const Photo = require("../models/Photo")
const User = require("../models/User")

const mongoose = require("mongoose")

//insert a photo with a user
const insertPhoto = async(req,res)=>{
  const {title} = req.body;
  const image = req.file.filename;

  const reqUser = req.user

  const user = User.findById(reqUser._id);

  console.log(user)

  //create a photo
  const newPhoto = await Photo.create({
    image,
    title,
    userId: user._id,
    userName: user.name,
  })

  

  if(!newPhoto){
    res.status(422).json({
      errors:["Houve um problema, tente novamente mais tarde."]
    })
  }

  res.status(201).json(newPhoto)
}

module.exports = {
  insertPhoto,
}