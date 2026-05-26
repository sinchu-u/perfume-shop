using backend.Data;
using backend.Models;
using backend.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace backend.Repositories
{
    public class ScentTypeRepository : IScentTypeRepository
    {
        private readonly ApplicationDBContext _context;
        public ScentTypeRepository(ApplicationDBContext context)
        {
            _context = context;
        }
        public async Task<ScentType> CreateAsync(ScentType scent)
        {
            await _context.ScentTypes.AddAsync(scent);
            await _context.SaveChangesAsync();
            return scent;
        }

        public async Task<ScentType?> DeleteAsync(int id)
        {
            var scent = await GetByIdAsync(id);
            if (scent == null) return null;

            _context.ScentTypes.Remove(scent);
            await _context.SaveChangesAsync();

            return scent;
        }

        public async Task<List<ScentType>> GetAllAsync()
        {
            return await _context.ScentTypes.ToListAsync();
        }

        public async Task<ScentType?> GetByIdAsync(int id)
        {
            return await _context.ScentTypes.FindAsync(id);
        }

        public async Task<ScentType?> UpdateAsync(int id, ScentType scent)
        {
            var updatedScent = await GetByIdAsync(id);
            if (updatedScent == null) return null;

            _context.Entry(updatedScent).CurrentValues.SetValues(scent);

            await _context.SaveChangesAsync();
            return updatedScent;
        }
    }
}