const db = require("../../models");
const { generateToken } = require("../middlewares/auth.middleware");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const { where } = require("sequelize");
const { uploadImage } = require("../lib/cloudinary");
const logger = require("pino")();

const signUp = async (req, res) => {
  const { email, password, username, role } = req.body;
  if (!email || !password || !username) {
    return res.status(400).json({
      status: "ERR",
      message: "Please fill in email, password and username",
    });
  }

  if (!validator.isEmail(email)) {
    return res.status(400).json({
      status: "ERR",
      message: "Email invalid -> Example Correct: abc@gmail.com",
    });
  }

  if (
    !validator.isStrongPassword(password, {
      minLength: 8,
      minUppercase: 1,
      minLowercase: 1,
      minNumbers: 1,
      minSymbols: 1, // chua ki tu dac biet
    })
  ) {
    return res.status(400).json({
      status: "ERR",
      message: "Password is not strong",
    });
  }

  if (username.length < 5) {
    return res.status(400).json({
      status: "ERR",
      message: "Min Length username is 5",
    });
  }

  if(!role || !['admin', 'customer'].includes(role)) {
    return res.status(400).json({
      status: 'ERR',
      message: 'Role is require -> Only two role (admin|customer)'
    })
  }
  const transaction = await db.sequelize.transaction();
  try {
    // check account exist
    const existAccount = await db.Account.findOne({
        where: {email}
    })
    if(existAccount) {
        return res.status(409).json({
            status: 'ERR',
            message: 'Email already exist'
        })
    }
    const { accessToken, refreshToken } = generateToken(email, res);
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);
    const Customer = await db.Customer.create({ transaction });
    const Account = await db.Account.create(
      {
        email,
        password: hashPassword,
        username,
        accessToken,
        refreshToken,
        cusId: Customer.cusId,
        role
      },
      { transaction }
    );
    await transaction.commit();
    if(Account) {
      const {password, ...responseAccount} = Account.toJSON();
      return res.status(201).json({
        status: "OK",
        account: responseAccount,
      });
    }
  } catch (err) {
    logger.error(`Sign up failed: ${err}`);
    await transaction.rollback();
    return res.status(400).json({
      status: "ERR",
      messageError: err,
    });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({
      status: "ERR",
      message: "Please fill in email and password",
    });
  }

  if (!validator.isEmail(email)) {
    return res.status(400).json({
      status: "ERR",
      message: "Email invalid -> Example Correct: abc@gmail.com",
    });
  }

  try {
    const Account = await db.Account.findOne({
      where: { email: email },
    });
    if (!Account) {
      return res.status(404).json({
        status: "OK",
        message: "Account not exist",
      });
    }

    const correctPassword = await bcrypt.compare(password, Account.password);
    if (!correctPassword) {
      return res.status(400).json({
        status: "ERR",
        message: "Email or password not correct",
      });
    }
    // generate token and set cookies
    generateToken(email, res);
    return res.status(200).json({
      status: "OK",
      message: "Login successfully",
    });
  } catch (err) {
    logger.error(`Login failed ${err}`);
    return res.status(500).json({
      status: "ERR",
      message: "Internal Server Error",
    });
  }
};

const logout = async (req, res) => {
  res.cookie("jwt", null);
  return res.status(200).json({
    status: "OK",
    message: "Logout successfully",
  });
};

const getUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id)
      return res.status(400).json({
        status: "ERR",
        message: "Please provider cusId of account",
      });
    const User = await db.Customer.findOne({ cusId: id });
    if (!User)
      return res.status(404).json({
        status: "ERR",
        message: "Customer is not register account",
      });
    return res.status(200).json({
      status: "OK",
      message: "Get customer successfully",
      data: User,
    });
  } catch (err) {
    return res.status(500).json({
      status: "ERR",
      message: "Get customer failed " + err,
    });
  }
};

const updateProfileUser = async (req, res) => {
  const minAge = 18;
  const { id } = req.params;
  const { name, age, phone, image, dob } = req.body;
  if (!name || !age || !phone || !dob) {
    return res.status(400).json({
      status: "ERR",
      message: "Please fill in all field",
    });
  }
  if (!/^[a-zA-Z ]+$/.test(name)) {
    return res.status(400).json({
      status: "ERR",
      message: "Name is not valid",
    });
  }
  if (!Number.isInteger(+age) || +age < minAge) {
    return res.status(400).json({
      status: "ERR",
      message: "Age is a number",
    });
  }
  if (!/^(03|09|05|07|08)\d{8}$/.test(phone.trim())) {
    return res.status(400).json({
      status: "ERR",
      message:
        "Phone is not valid -> Phone start (03|05|07|08|09) and after is 8 number character",
    });
  }
  
  if(typeof image == "string" && !validator.isURL(image)) {
    return res.status(400).json({
      status: 'ERR',
      message: 'Image is type string base 64 or type FileImage'
    })
  }

  if (!validator.isDate(dob.trim())) {
    return res.status(400).json({
      status: "ERR",
      message: "Date is not valid",
    });
  }
  const transaction = await db.sequelize.transaction()
  try {
    const existUser = await db.Customer.findOne({ cusId: id });
    if (!existUser)
      return res.status(404).json({
        status: "ERR",
        message: "Not found customer",
      });
    else {
      // upload image
      let imageUrl = "";
      if(req.file || image) {
        let urlImageUpload = ""
        if(req.file) {
          const base64 = req.file.buffer.toString('base64')
        const formatUrlImage = `data:${req.file.mimetype};base64,${base64}`
          urlImageUpload = await uploadImage(formatUrlImage)
        } else {
          urlImageUpload = await uploadImage(image)
        }
         imageUrl = urlImageUpload
      }
      
      if (imageUrl === null) {
        return res.status(500).json({
          status: "ERR",
          message: "Upload image failed, try again",
        });
      } else {
        await db.Customer.update(
          {
            name,
            age,
            phone,
            image: imageUrl,
            dob,
          },
          {
            where: { cusId: id },
            transaction
          }
        );
        await transaction.commit()
        return res.status(200).json({
          status: "OK",
          message: "Update customer profile successfully",
        });
      }
    }
  } catch (err) {
    logger.error(`Update customer profile is failed: ${err}`)
    await transaction.rollback()
    return res.status(500).json({
      status: "ERR",
      message: "Update customer profile is failed: " + err,
    });
  }
};

module.exports = { login, signUp, logout, getUser, updateProfileUser };
