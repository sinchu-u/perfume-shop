using backend.Data;
using backend.Helpers;
using backend.Models;
using backend.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace backend.Repositories
{
    public class CommentRepository : ICommentRepository
    {
        private readonly ApplicationDBContext _context;
        public CommentRepository(ApplicationDBContext context)
        {
            _context = context;
        }

        public async Task<Comment> CreateAsync(Comment comment)
        {
            await _context.Comments.AddAsync(comment);
            await _context.SaveChangesAsync();
            return comment;
        }

        public async Task<Comment?> DeleteAsync(int id)
        {
            var comment = await GetByIdAsync(id);
            if (comment == null) return null;

            _context.Comments.Remove(comment);
            await _context.SaveChangesAsync();
            
            return comment;
        }

        public async Task<PagedResult<Comment>> GetAllAsync(CommentQueryObject query)
        {
            var commentsQuery = _context.Comments.Include(c => c.User).OrderByDescending(c => c.Id).AsQueryable();

            var pageNumber = query.PageNumber < 1 ? 1 : query.PageNumber;
            var pageSize = query.PageSize < 1 ? 10 : query.PageSize;

            var totalItems = await commentsQuery.CountAsync();
            var skipNumber = (pageNumber - 1) * pageSize;
            var items = await commentsQuery.Skip(skipNumber).Take(pageSize).ToListAsync();

            return new PagedResult<Comment>
            {
                Items = items,
                TotalItems = totalItems,
                PageNumber = pageNumber,
                PageSize = pageSize
            };
        }

        public async Task<Comment?> GetByIdAsync(int id)
        {
            return await _context.Comments.Include(c => c.User).FirstOrDefaultAsync(c => c.Id == id);
        }

        public async Task<Comment?> UpdateAsync(int id, Comment comment)
        {
            var updatedComment = await GetByIdAsync(id);
            if (updatedComment == null) return null;

            updatedComment.Rating = comment.Rating;
            updatedComment.Text = comment.Text;

            await _context.SaveChangesAsync();
            return updatedComment;
        }
    }
}