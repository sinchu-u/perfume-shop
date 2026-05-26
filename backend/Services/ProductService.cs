using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.DTOs.ProductDTOs;
using backend.Helpers;
using backend.Interfaces;
using backend.Mappers;
using backend.Models;
using backend.Repositories.Interfaces;
using backend.Services.Interfaces;

namespace backend.Services
{
    public class ProductService : IProductService
    {
        private readonly IProductRepository _productRepository;
        private readonly IBrandRepository _brandRepository;
        private readonly ICategoryRepository _categoryRepository;
        private readonly IScentTypeRepository _scentRepository;
        private readonly IWebHostEnvironment _webHostEnvironment;
        public ProductService(IProductRepository repository, IBrandRepository brandRepository,
        ICategoryRepository categoryRepository, IScentTypeRepository scentRepository,
        IWebHostEnvironment webHostEnvironment)
        {
            _productRepository = repository;
            _brandRepository = brandRepository;
            _categoryRepository = categoryRepository;
            _scentRepository = scentRepository;
            _webHostEnvironment = webHostEnvironment;
        }
        public async Task<ProductDTO> CreateAsync(CreateProductDTO productDTO)
        {
            var relativeImageUrl = await SaveImage(productDTO.Image);

            var brand = await _brandRepository.GetByIdAsync(productDTO.BrandId);
            if (brand == null)
            {
                throw new KeyNotFoundException("Не вдалося створити позицію: бренд не знайдено.");
            }
            var category = await _categoryRepository.GetByIdAsync(productDTO.CategoryId);
            if (category == null)
            {
                throw new KeyNotFoundException("Не вдалося створити позицію: категорію не знайдено.");
            }
            var scent = await _scentRepository.GetByIdAsync(productDTO.ScentTypeId);
            if (scent == null)
            {
                throw new KeyNotFoundException("Не вдалося створити позицію: тип запаху не знайдено.");
            }

            var product = productDTO.ToProductFromCreate(relativeImageUrl);
            await _productRepository.CreateAsync(product);

            return product.ToProductDTO();
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var product = await _productRepository.DeleteAsync(id);
            if (product == null)
            {
                throw new KeyNotFoundException("Не вдалося видалити позицію: товар не знайдено.");
            }
            return product != null;
        }

        public async Task<PagedResult<ProductDTO>> GetAllAsync(ProductQueryObject query)
        {
            var pagedProducts = await _productRepository.GetAllAsync(query);
            var items = pagedProducts.Items.Select(x => x.ToProductDTO()).ToList();

            return new PagedResult<ProductDTO>
            {
                Items = items,
                TotalItems = pagedProducts.TotalItems,
                PageNumber = pagedProducts.PageNumber,
                PageSize = pagedProducts.PageSize
            };
        }

        public async Task<ProductDTO?> GetByIdAsync(int id)
        {
            var product = await _productRepository.GetByIdAsync(id);
            if (product == null)
            {
                throw new KeyNotFoundException($"Товар з ID {id} не знайдено");
            }

            return product.ToProductDTO();
        }

        public async Task<bool> ProductExists(int id)
        {
            if (await _productRepository.ExistsAsync(id)) return true;
            else return false;
        }

        public async Task<ProductDTO?> UpdateAsync(int id, UpdateProductDTO productDTO)
        {
            var relativeImageUrl = await SaveImage(productDTO.Image);

            var brand = await _brandRepository.GetByIdAsync(productDTO.BrandId);
            if (brand == null)
            {
                throw new KeyNotFoundException("Не вдалося оновити позицію: бренд не знайдено.");
            }
            var category = await _categoryRepository.GetByIdAsync(productDTO.CategoryId);
            if (category == null)
            {
                throw new KeyNotFoundException("Не вдалося оновити позицію: категорію не знайдено.");
            }
            var scent = await _scentRepository.GetByIdAsync(productDTO.ScentTypeId);
            if (scent == null)
            {
                throw new KeyNotFoundException("Не вдалося оновити позицію: тип запаху не знайдено.");
            }

            var product = await _productRepository.UpdateAsync(id, productDTO.ToProductFromUpdate(id, relativeImageUrl));
            if (product == null)
            {
                throw new KeyNotFoundException("Не вдалося оновити позицію: товар не знайдено.");
            }

            return product.ToProductDTO();
        }
        public async Task<string> SaveImage(IFormFile image)
        {
            var extension = Path.GetExtension(image.FileName);
            var uniqueFileName = $"{Guid.NewGuid()}{extension}";
            var uploadsFolder = Path.Combine(_webHostEnvironment.WebRootPath, "images", "products");

            if (!Directory.Exists(uploadsFolder))
            {
                Directory.CreateDirectory(uploadsFolder);
            }

            var filePath = Path.Combine(uploadsFolder, uniqueFileName);

            using (var fileStream = new FileStream(filePath, FileMode.Create))
            {
                await image.CopyToAsync(fileStream);
            }

            return $"/images/products/{uniqueFileName}";
        }
    }
}