'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(db) {
      // define association here
      db.User.hasMany(db.Post, { foreignKey: 'postId', sourceKey: 'userId' });
      db.User.hasMany(db.Comment, { foreignKey: 'commentId', sourceKey: 'userId' });
      // as로 별칭을 정하는 것이 좋다, through: 테이블 이름을 변경
      // post.addLikers, post.removeLikers
      db.User.belongsToMany(db.Post, { foreignKey: 'postId', through: 'Like', as: 'Liked' }); // 내가 좋아요를 누른 게시물
      // foreignKey: column의 key를 변경, 같은 테이블일때 먼저 찾는 것을 정의 (반대로 생각하면 된다)
    }
  }
  User.init(
    {
      userId: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      nickname: DataTypes.STRING,
      password: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: 'User',
    }
  );
  return User;
};
