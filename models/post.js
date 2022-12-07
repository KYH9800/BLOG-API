'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Post extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(db) {
      // define association here
      db.Post.belongsTo(db.User, { foreignKey: 'userId', targetKey: 'userId' }); // post.addUser, post.getUser, post.setUser
      db.Post.hasMany(db.Comment, { foreignKey: 'commentId', sourceKey: 'postId' }); // post.addComments, post.getComments
      // post.addLikers, post.removeLikers
      db.Post.belongsToMany(db.User, { foreignKey: 'userId', through: 'Like', as: 'Likers' }); // post.addLikers, post.removeLikers
    }
  }
  Post.init(
    {
      postId: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      title: DataTypes.STRING,
      content: DataTypes.STRING,
      likes: DataTypes.STRING,
      nickname: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: 'Post',
    }
  );
  return Post;
};
