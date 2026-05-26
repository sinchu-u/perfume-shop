using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace backend.DTOs.ProductDTOs
{
    public class ProductVariantDTO
    {
        public int Id { get; set; }
        public int VolumeMl { get; set; }
        public int Stock { get; set; }
        public decimal Price { get; set; }
        public int? ProductId { get; set; }
    }
}