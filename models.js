const { DataTypes } = require('sequelize')
const { sequelize } = require('./connectionBD.js')

const technikdirektProduct = sequelize.define('technikdirekt', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  price: {
    type: DataTypes.FLOAT,
  },
  deliveryTime: {
    type: DataTypes.STRING,
  },
  photo: {
    type: DataTypes.STRING,
  },
});

const alternateProduct = sequelize.define('alternate', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  price: {
    type: DataTypes.FLOAT,
  },
  qualityRating: {
    type: DataTypes.STRING,
  },
  deliveryTime: {
    type: DataTypes.STRING,
  },
  photo: {
    type: DataTypes.STRING,
  },
});

const conradProduct = sequelize.define('conrad', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  price: {
    type: DataTypes.FLOAT,
  },
  deliveryTime: {
    type: DataTypes.STRING,
  },
  reviewCount: {
    type: DataTypes.STRING,
  },
  photo: {
    type: DataTypes.STRING,
  },
});

const hifiReglerProduct = sequelize.define('hifiRegler', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  price: {
    type: DataTypes.FLOAT,
  },
  deliveryTime: {
    type: DataTypes.STRING,
  },
  photo: {
    type: DataTypes.STRING,
  },
});


const medimaxProduct = sequelize.define('medimax', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  price: {
    type: DataTypes.FLOAT,
  },
  deliveryTime: {
    type: DataTypes.STRING,
  },
});

module.exports = { technikdirektProduct, alternateProduct, conradProduct, hifiReglerProduct, medimaxProduct};