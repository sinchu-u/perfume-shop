using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.DTOs.CommentDTOs;
using backend.Models;

namespace backend.Mappers
{
    public static class CommentMapper
    {
        public static CommentDTO ToCommentDTO(this Comment comment)
        {
            return new CommentDTO
            {
                Id = comment.Id,
                ProductId = comment.ProductId,
                UserId = comment.UserId,
                UserName = comment.User.UserName,
                Rating = comment.Rating,
                Text = comment.Text,
                CreatedAt = comment.CreatedAt
            };
        }
        public static Comment ToCommentFromCreate(this CreateCommentDTO commentDTO, int productId)
        {
            return new Comment
            {
                ProductId = productId,
                Rating = commentDTO.Rating,
                Text = commentDTO.Text
            };
        }
        public static Comment ToCommentFromUpdate(this UpdateCommentDTO commentDTO)
        {
            return new Comment
            {
                Rating = commentDTO.Rating,
                Text = commentDTO.Text
            };
        }
    }
}