using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.Data;
using backend.Models;
using backend.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace backend.Repositories
{
    public class ProductVariantRepository : IProductVariantRepository
    {
        private readonly ApplicationDBContext _context;
        public ProductVariantRepository(ApplicationDBContext context)
        {
            _context = context;
        }
        public async Task<ProductVariant> CreateAsync(ProductVariant variant)
        {
            await _context.ProductVariants.AddAsync(variant);
            await _context.SaveChangesAsync();
            return variant;
        }

        public async Task<ProductVariant?> DeleteAsync(int id)
        {
            var variant = await GetByIdAsync(id);
            if (variant == null) return null;

            _context.ProductVariants.Remove(variant);
            await _context.SaveChangesAsync();

            return variant;
        }

        public async Task<ProductVariant?> GetByIdAsync(int id)
        {
            return await _context.ProductVariants.FirstOrDefaultAsync(x => x.Id == id);
        }

        public async Task<List<int>> GetVolumesAsync()
        {
            return await _context.ProductVariants.Select(v => v.VolumeMl).Distinct().OrderBy(v => v).ToListAsync();
        }

        public async Task<ProductVariant?> UpdateAsync(int id, ProductVariant variant)
        {
            var updatedVariant = await GetByIdAsync(id);
            if (updatedVariant == null) return null;

            _context.Entry(updatedVariant).CurrentValues.SetValues(variant);

            await _context.SaveChangesAsync();
            return updatedVariant;
        }
    }
}