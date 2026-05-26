using backend.Data;
using backend.Interfaces;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Repositories
{
    public class BrandRepository : IBrandRepository
    {
        private readonly ApplicationDBContext _context;

        public BrandRepository(ApplicationDBContext context)
        {
            _context = context;
        }

        public async Task<List<Brand>> GetAllAsync()
        {
            return await _context.Brands.ToListAsync();
        }

        public async Task<Brand?> GetByIdAsync(int id)
        {
            return await _context.Brands.FindAsync(id);
        }

        public async Task<Brand> CreateAsync(Brand brand)
        {
            await _context.Brands.AddAsync(brand);
            await _context.SaveChangesAsync();
            return brand;
        }

        public async Task<Brand?> UpdateAsync(int id, Brand brand)
        {
            var updatedBrand = await GetByIdAsync(id);
            if (updatedBrand == null) return null;

            _context.Entry(updatedBrand).CurrentValues.SetValues(brand);

            await _context.SaveChangesAsync();
            return updatedBrand;
        }

        public async Task<Brand?> DeleteAsync(int id)
        {
            var brand = await GetByIdAsync(id);
            if (brand == null) return null;

            _context.Brands.Remove(brand);
            await _context.SaveChangesAsync();

            return brand;
        }
    }
}