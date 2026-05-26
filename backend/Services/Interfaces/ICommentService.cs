using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.DTOs.CommentDTOs;
using backend.Helpers;

namespace backend.Services.Interfaces
{
    public interface ICommentService
    {
        Task<PagedResult<CommentDTO>> GetAllAsync(CommentQueryObject query);
        Task<CommentDTO?> GetByIdAsync(int id);
        Task<CommentDTO> CreateAsync(int productId, string userId, CreateCommentDTO commentDTO);
        Task<CommentDTO?> UpdateAsync(int id, string userId, UpdateCommentDTO commentDTO);
        Task<bool> DeleteAsync(int id, string userId);
    }
}