'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Comment extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(db) {
      // define association here
      db.Comment.belongsTo(db.User, { foreignKey: 'userId', targetKey: 'userId' }); // 어떤 댓글을 작성자에 속해있다
      db.Comment.belongsTo(db.Post, { foreignKey: 'postId', targetKey: 'postId' }); // 어떤 댓글은 게시글에 속해있다
    }
  }
  Comment.init(
    {
      commentId: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      comment: DataTypes.STRING,
      nickname: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: 'Comment',
    }
  );
  return Comment;
};
