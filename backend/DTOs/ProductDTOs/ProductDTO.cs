using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.DTOs.CommentDTOs;
using backend.Models;

namespace backend.DTOs.ProductDTOs
{
    public class ProductDTO
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Image { get; set; } = string.Empty;
        public List<ProductVariantDTO> Variants { get; set; } = new List<ProductVariantDTO>();
        public List<CommentDTO> Comments { get; set; } = new List<CommentDTO>();
        
        public int BrandId { get; set; }
        public int CategoryId { get; set; }
        public int ScentTypeId { get; set; }
    }
}