using System.Runtime.CompilerServices;
using backend.Data;
using backend.Helpers;
using backend.Models;
using backend.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace backend.Repositories
{
    public class ProductRepository : IProductRepository
    {
        private readonly ApplicationDBContext _context;
        public ProductRepository(ApplicationDBContext context)
        {
            _context = context;
        }
        public async Task<Product> CreateAsync(Product product)
        {
            await _context.Products.AddAsync(product);
            await _context.SaveChangesAsync();
            return product;
        }

        public async Task<Product?> DeleteAsync(int id)
        {
            var product = await GetByIdAsync(id);
            if (product == null) return null;

            _context.Products.Remove(product);
            await _context.SaveChangesAsync();

            return product;
        }

        public async Task<PagedResult<Product>> GetAllAsync(ProductQueryObject query)
        {
            var productsQuery = _context.Products.Include(x => x.Comments).Include(x => x.Variants).Include(x => x.Brand).Include(x => x.Category).Include(x => x.ScentType).AsSplitQuery().AsQueryable();
            productsQuery = productsQuery.OrderByDescending(x => x.Variants.Any(v => v.Stock > 0));

            if (!string.IsNullOrWhiteSpace(query.Search))
            {
                productsQuery = productsQuery.Where(p => p.Name.ToLower().Contains(query.Search.ToLower()));
            }

            if (!string.IsNullOrWhiteSpace(query.Brand))
            {
                productsQuery = productsQuery.Where(x => x.Brand != null && x.Brand.Name.ToLower() == query.Brand.ToLower());
            }

            if (!string.IsNullOrWhiteSpace(query.Category))
            {
                productsQuery = productsQuery.Where(x => x.Category != null && x.Category.Name.ToLower() == query.Category.ToLower());
            }

            if (!string.IsNullOrWhiteSpace(query.SortBy))
            {
                if (query.SortBy.Equals("Price", StringComparison.OrdinalIgnoreCase))
                {
                    productsQuery = query.IsDescending 
                        ? productsQuery.OrderByDescending(x => x.Variants.Any() ? x.Variants.Min(v => v.Price) : 0)
                        : productsQuery.OrderBy(x => x.Variants.Any() ? x.Variants.Min(v => v.Price) : 0);
                }
                else if (query.SortBy.Equals("Rating", StringComparison.OrdinalIgnoreCase))
                {
                    productsQuery = query.IsDescending 
                        ? productsQuery.OrderByDescending(x => x.Comments.Any() ? x.Comments.Average(r => r.Rating) : 0)
                        : productsQuery.OrderBy(x => x.Comments.Any() ? x.Comments.Average(r => r.Rating) : 0);
                }
            }
            var pageNumber = query.PageNumber < 1 ? 1 : query.PageNumber;
            var pageSize = query.PageSize < 1 ? 10 : query.PageSize;

            var totalItems = await productsQuery.CountAsync();
            var skipNumber = (pageNumber - 1) * pageSize;
            var items = await productsQuery.Skip(skipNumber).Take(pageSize).ToListAsync();

            return new PagedResult<Product>
            {
                Items = items,
                TotalItems = totalItems,
                PageNumber = pageNumber,
                PageSize = pageSize
            };
        }

        public async Task<Product?> GetByIdAsync(int id)
        {
            return await _context.Products.Include(x => x.Comments).Include(x => x.Variants).Include(x => x.Brand).Include(x => x.Category).Include(x => x.ScentType).AsSplitQuery().FirstOrDefaultAsync(i => i.Id == id);
        }

        public async Task<Product?> UpdateAsync(int id, Product product)
        {
            var updatedProduct = await GetByIdAsync(id);
            if (updatedProduct == null) return null;

            _context.Entry(updatedProduct).CurrentValues.SetValues(product);

            await _context.SaveChangesAsync();
            return updatedProduct;
        }
        public async Task<bool> ExistsAsync(int id)
        {
            return await _context.Products.AnyAsync(p => p.Id == id);
        }
    }
}