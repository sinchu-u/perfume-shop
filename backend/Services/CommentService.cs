using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.DTOs.CommentDTOs;
using backend.Helpers;
using backend.Mappers;
using backend.Repositories.Interfaces;
using backend.Services.Interfaces;

namespace backend.Services
{
    public class CommentService : ICommentService
    {
        private readonly ICommentRepository _commentRepository;
        private readonly IProductRepository _productRepository;
        public CommentService(ICommentRepository repository, IProductRepository productRepository)
        {
            _commentRepository = repository;
            _productRepository = productRepository;
        }

        public async Task<CommentDTO> CreateAsync(int productId, string userId, CreateCommentDTO commentDTO)
        {
            var product = await _productRepository.ExistsAsync(productId);
            if (!product)
            {
                throw new KeyNotFoundException("Не вдалося створити коментар: товар не знайдено.");
            }

            var comment = commentDTO.ToCommentFromCreate(productId);
            comment.UserId = userId;

            await _commentRepository.CreateAsync(comment);
            var createdComment = await _commentRepository.GetByIdAsync(comment.Id);

            return createdComment.ToCommentDTO();
        }

        public async Task<bool> DeleteAsync(int id, string userId)
        {
            var comment = await _commentRepository.GetByIdAsync(id);
            if (comment == null)
            {
                throw new KeyNotFoundException("Не вдалося видалити коментар: коментар не знайдено.");
            }
            if (comment.UserId != userId)
            {
                throw new UnauthorizedAccessException("Ви не можете видалити чужий коментар.");
            }

            await _commentRepository.DeleteAsync(id);

            return true;
        }

        public async Task<PagedResult<CommentDTO>> GetAllAsync(CommentQueryObject query)
        {
            var pagedComments = await _commentRepository.GetAllAsync(query);

            var items = pagedComments.Items.Select(x => x.ToCommentDTO()).ToList();

            return new PagedResult<CommentDTO>
            {
                Items = items,
                TotalItems = pagedComments.TotalItems,
                PageNumber = pagedComments.PageNumber,
                PageSize = pagedComments.PageSize
            };
        }

        public async Task<CommentDTO?> GetByIdAsync(int id)
        {
            var comment = await _commentRepository.GetByIdAsync(id);
            if (comment == null)
            {
                throw new KeyNotFoundException($"Коментар з ID {id} не знайдено.");
            }

            return comment.ToCommentDTO();
        }

        public async Task<CommentDTO?> UpdateAsync(int id, string userId, UpdateCommentDTO commentDTO)
        {
            var comment = await _commentRepository.GetByIdAsync(id);
            if (comment == null)
            {
                throw new KeyNotFoundException("Не вдалося оновити коментар: коментар не знайдено.");
            }

            if (comment.UserId != userId)
            {
                throw new UnauthorizedAccessException("Ви не можете редагувати чужий коментар.");
            }

            comment.Rating = commentDTO.Rating;
            comment.Text = commentDTO.Text;

            var updatedComment = await _commentRepository.UpdateAsync(id, comment);

            return updatedComment?.ToCommentDTO();
        }
    }
}