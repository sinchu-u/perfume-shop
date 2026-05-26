using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;
using backend.DTOs.CommentDTOs;
using backend.Models;

namespace backend.DTOs.ProductDTOs
{
    public class UpdateProductDTO
    {
        [Required(ErrorMessage = "Поле з назвою повинно бути заповненим.")]
        public string Name { get; set; } = string.Empty;
        [Required(ErrorMessage = "Поле з описом повинно бути заповненим.")]
        public string Description { get; set; } = string.Empty;
        [Required(ErrorMessage = "Прикріпіть зображення.")]
        public IFormFile Image { get; set; }
        public List<ProductVariantDTO> Variants { get; set; } = new List<ProductVariantDTO>();
        public List<CommentDTO> Comments { get; set; } = new List<CommentDTO>();
        
        [Required(ErrorMessage = "Вкажіть бренд для продукту.")]
        public int BrandId { get; set; }
        [Required(ErrorMessage = "Вкажіть категорію для продукту.")]
        public int CategoryId { get; set; }
        [Required(ErrorMessage = "Вкажіть тип запаху для продукту.")]
        public int ScentTypeId { get; set; }
    }
}